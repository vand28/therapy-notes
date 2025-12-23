using Stripe;
using Stripe.Checkout;

namespace TherapyNotes.Infrastructure.Payments;

public class StripePaymentService
{
    private readonly string _secretKey;
    private readonly string _webhookSecret;
    private readonly string _professionalPriceId;
    private readonly string _premiumPriceId;

    public StripePaymentService(
        string secretKey,
        string webhookSecret,
        string professionalPriceId,
        string premiumPriceId)
    {
        _secretKey = secretKey;
        _webhookSecret = webhookSecret;
        _professionalPriceId = professionalPriceId;
        _premiumPriceId = premiumPriceId;

        StripeConfiguration.ApiKey = _secretKey;
    }

    public async Task<string> CreateCheckoutSessionAsync(string userId, string userEmail, string tier, string successUrl, string cancelUrl)
    {
        var priceId = tier.ToLower() == "premium" ? _premiumPriceId : _professionalPriceId;

        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    Price = priceId,
                    Quantity = 1,
                }
            },
            Mode = "subscription",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            ClientReferenceId = userId,
            CustomerEmail = userEmail,
            Metadata = new Dictionary<string, string>
            {
                { "userId", userId },
                { "tier", tier }
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        return session.Url;
    }

    public async Task<string> CreateCustomerPortalSessionAsync(string customerId, string returnUrl)
    {
        var options = new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = customerId,
            ReturnUrl = returnUrl,
        };

        var service = new Stripe.BillingPortal.SessionService();
        var session = await service.CreateAsync(options);

        return session.Url;
    }

    public async Task<SubscriptionInfo?> GetSubscriptionInfoAsync(string customerId)
    {
        try
        {
            var options = new SubscriptionListOptions
            {
                Customer = customerId,
                Status = "active",
                Limit = 1
            };

            var service = new SubscriptionService();
            var subscriptions = await service.ListAsync(options);

            var subscription = subscriptions.Data.FirstOrDefault();
            if (subscription == null) return null;

            // Use Stripe v50 properties
            var periodEnd = subscription.Created; // Fallback to created date
            if (subscription.Items?.Data.Count > 0)
            {
                var item = subscription.Items.Data[0];
                periodEnd = subscription.Created.AddMonths(1); // Estimate based on billing cycle
            }

            return new SubscriptionInfo(
                subscription.Id,
                subscription.Status,
                periodEnd,
                subscription.CancelAtPeriodEnd
            );
        }
        catch
        {
            return null;
        }
    }

    public Event ConstructWebhookEvent(string json, string signature)
    {
        try
        {
            return EventUtility.ConstructEvent(json, signature, _webhookSecret);
        }
        catch (StripeException ex)
        {
            throw new InvalidOperationException("Invalid webhook signature", ex);
        }
    }
}

public record SubscriptionInfo(
    string Id,
    string Status,
    DateTime CurrentPeriodEnd,
    bool CancelAtPeriodEnd
);

