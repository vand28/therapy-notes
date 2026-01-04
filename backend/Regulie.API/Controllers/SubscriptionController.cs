using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using Regulie.Core.Models;
using Regulie.Infrastructure.MongoDB;
using Regulie.Infrastructure.Payments;

namespace Regulie.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubscriptionController : ControllerBase
{
    private readonly StripePaymentService _stripeService;
    private readonly MongoDbContext _dbContext;

    public SubscriptionController(StripePaymentService stripeService, MongoDbContext dbContext)
    {
        _stripeService = stripeService;
        _dbContext = dbContext;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();

    [Authorize]
    [HttpPost("checkout")]
    public async Task<ActionResult<object>> CreateCheckoutSession([FromBody] CheckoutRequest request)
    {
        try
        {
            var userId = GetUserId();
            var user = await _dbContext.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            var successUrl = $"{Request.Scheme}://{Request.Host}/dashboard?session_id={{CHECKOUT_SESSION_ID}}";
            var cancelUrl = $"{Request.Scheme}://{Request.Host}/dashboard/upgrade";

            var checkoutUrl = await _stripeService.CreateCheckoutSessionAsync(
                userId,
                user.Email,
                request.Tier,
                successUrl,
                cancelUrl
            );

            return Ok(new { url = checkoutUrl });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to create checkout session", error = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("portal")]
    public async Task<ActionResult<object>> CreatePortalSession()
    {
        try
        {
            var userId = GetUserId();
            var user = await _dbContext.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            
            if (user == null || string.IsNullOrEmpty(user.StripeCustomerId))
                return BadRequest(new { message = "No active subscription found" });

            var returnUrl = $"{Request.Scheme}://{Request.Host}/dashboard/settings";
            var portalUrl = await _stripeService.CreateCustomerPortalSessionAsync(user.StripeCustomerId, returnUrl);

            return Ok(new { url = portalUrl });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to create portal session", error = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("status")]
    public async Task<ActionResult<object>> GetSubscriptionStatus()
    {
        try
        {
            var userId = GetUserId();
            var user = await _dbContext.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            if (string.IsNullOrEmpty(user.StripeCustomerId))
            {
                return Ok(new
                {
                    tier = user.SubscriptionTier,
                    status = "free",
                    hasPaymentMethod = false
                });
            }

            var subscription = await _stripeService.GetSubscriptionInfoAsync(user.StripeCustomerId);
            
            return Ok(new
            {
                tier = user.SubscriptionTier,
                status = subscription?.Status ?? "free",
                currentPeriodEnd = subscription?.CurrentPeriodEnd,
                cancelAtPeriodEnd = subscription?.CancelAtPeriodEnd,
                hasPaymentMethod = true
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to get subscription status", error = ex.Message });
        }
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> HandleWebhook()
    {
        try
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var signature = Request.Headers["Stripe-Signature"].ToString();

            var stripeEvent = _stripeService.ConstructWebhookEvent(json, signature);

            // Handle different event types
            switch (stripeEvent.Type)
            {
                case "checkout.session.completed":
                    await HandleCheckoutSessionCompleted(stripeEvent);
                    break;

                case "customer.subscription.updated":
                case "customer.subscription.deleted":
                    await HandleSubscriptionChange(stripeEvent);
                    break;
            }

            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Webhook error", error = ex.Message });
        }
    }

    private async Task HandleCheckoutSessionCompleted(Stripe.Event stripeEvent)
    {
        var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
        if (session == null) return;

        var userId = session.ClientReferenceId;
        var customerId = session.Customer?.Id;
        var tier = session.Metadata.TryGetValue("tier", out var t) ? t : "professional";

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(customerId)) return;

        var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
        var update = Builders<User>.Update
            .Set(u => u.StripeCustomerId, customerId)
            .Set(u => u.SubscriptionTier, tier);

        await _dbContext.Users.UpdateOneAsync(filter, update);
    }

    private async Task HandleSubscriptionChange(Stripe.Event stripeEvent)
    {
        var subscription = stripeEvent.Data.Object as Stripe.Subscription;
        if (subscription == null) return;

        var customerId = subscription.CustomerId;
        var user = await _dbContext.Users.Find(u => u.StripeCustomerId == customerId).FirstOrDefaultAsync();
        
        if (user == null) return;

        var filter = Builders<User>.Filter.Eq(u => u.Id, user.Id);
        var update = Builders<User>.Update.Set(u => u.SubscriptionTier, 
            subscription.Status == "active" ? user.SubscriptionTier : "free");

        await _dbContext.Users.UpdateOneAsync(filter, update);
    }
}

public record CheckoutRequest(string Tier);

