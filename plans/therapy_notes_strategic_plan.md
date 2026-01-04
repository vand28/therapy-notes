---
name: Therapy Notes Strategic Plan
overview: A dual-sided platform strategy targeting therapists as primary customers while leveraging parents as viral growth engines, maximizing value and monetization from day one.
todos:
  - id: quick_entry_mode
    content: Build mobile-first Quick Entry Mode - 30-second session summary with voice-to-text and photo snap
    status: pending
  - id: encryption_database
    content: Enable MongoDB encryption at rest for MongoDB Docker - configure WiredTiger encryption with encryption key management
    status: pending
  - id: update_pricing
    content: "Update subscription tiers for Philippines: Free (10 clients, 50 sessions, 1GB), Professional PHP 299/mo, Premium PHP 599/mo, Practice PHP 1,499/mo"
    status: pending
  - id: payment_methods_ph
    content: "Integrate Philippines payment methods: GCash, PayMaya (Maya), PayPal, and credit cards"
    status: pending
  - id: progress_dashboard
    content: Create visual Progress Dashboard for parents with charts, goal completion, and milestone celebrations
    status: pending
  - id: weekly_digest_email
    content: Implement auto-generated Weekly Digest Email sent to parents with progress summary
    status: pending
  - id: viral_features
    content: "Add viral growth features: share buttons in parent portal, referral program (therapist gets free month), social sharing for milestones"
    status: pending
  - id: landing_page
    content: "Create therapist-focused landing page with value proposition: Save 2-3 hours/week, reduce parent calls by 80%"
    status: pending
  - id: question_box
    content: Build async Question Box feature - parents ask questions, therapists respond when convenient
    status: pending
  - id: template_marketplace
    content: Create template marketplace where therapists can share custom templates with community
    status: pending
  - id: encryption_transit
    content: Verify HTTPS/TLS enabled on production - check hosting provider settings, force HTTPS redirects, test SSL certificate
    status: pending
  - id: encryption_storage
    content: Update S3StorageService.cs to use AES-256 server-side encryption and enable bucket default encryption
    status: pending
---

# Therapy Notes St

rategic Business Plan

## Executive Summary

**Primary Target: Individual Therapists in the Philippines** (solo OT/Speech therapists)**Secondary Target: Parents** (as viral growth engine and value multiplier)**Strategy: Therapist-First, Parent-Powered Growth - Philippines Market**The app is **primarily targeted at Filipino therapists** with affordable pricing and generous limits. **Parents become the viral growth mechanism** and value amplifier. This creates a network effect where each therapist brings 5-20 parents, and happy parents refer other therapists.**Market Context:**

- Philippines therapists earn PHP 20,000-40,000/month
- Pricing must be affordable: PHP 200-800/month
- Free tier must be generous enough for real use
- Facebook is primary marketing channel (not Reddit/LinkedIn)
- Payment methods: GCash, PayMaya (Maya), PayPal, credit cards

---

## Core Strategic Positioning

### The Problem We're Solving

**For Therapists:**

- Documentation is time-consuming (30-60 min/day)
- Parents constantly ask "How's my kid doing?"
- Insurance requires detailed progress reports
- No easy way to show value to parents
- Competing with cheaper alternatives (paper notes, basic EHRs)

**For Parents:**

- Want to see their child's progress
- Need guidance on home activities
- Feel disconnected from therapy process
- Want to celebrate milestones
- Need documentation for IEP meetings

### The Solution: Dual-Sided Value

**Therapist Value:**

- Saves 2-3 hours/week on documentation
- Reduces parent calls by 80%
- Professional reports for insurance
- Shows clear ROI to parents (justifies rates)
- Mobile-first quick entry

**Parent Value:**

- See progress in real-time
- Get home activity suggestions
- Celebrate milestones
- Feel involved in therapy
- Professional reports for IEPs

---

## Monetization Strategy

### Revised Pricing Model

#### Free Tier (Lead Magnet + Viral Engine)

- **10 clients** (generous enough for small practice)
- **50 sessions/month** (enough for 2-3 weeks of work)
- **1GB storage** (generous for photos/videos)
- **Basic parent portal** (unlimited parents per client)
- **Basic templates**
- **Mobile app access**
- **PDF progress reports** (basic)

**Purpose:** Generous enough for therapists to actually use and see value. Parents see progress and encourage therapist to upgrade for advanced features.

#### Professional Tier: PHP 299/month

- **Unlimited clients**
- **Unlimited sessions**
- **10GB storage**
- **Advanced parent portal** (unlimited parents per client)
- **PDF progress reports** (professional format)
- **Email notifications**
- **Analytics dashboard**
- **Calendar view**
- **Weekly digest emails** (auto-generated)

**Target:** Solo practitioners (80% of market)**Payment:** GCash, PayMaya (Maya), PayPal, credit cards

#### Premium Tier: PHP 599/month

- Everything in Professional
- **25GB storage**
- **Voice-to-text notes** (saves 50% time)
- **Custom branding** (therapist logo on reports)
- **Family sharing** (grandparents, etc.)
- **Priority support**
- **API access** (for integrations)
- **Advanced analytics** (goal tracking, progress charts)

**Target:** Established therapists, small practices**Payment:** PayPal, credit cards

#### Practice Tier: PHP 1,499/month

- **5 therapist accounts**
- **Unlimited clients**
- **Shared templates library**
- **Practice analytics**
- **Bulk operations**
- **Admin dashboard**

**Target:** Small clinics (3-10 therapists)**Payment:** GCash, PayMaya (Maya), PayPal, credit cards

### Revenue Projections (Philippines Market)

**Year 1 Conservative:**

- 100 therapists (30% paid = 30, lower conversion due to price sensitivity)
- 20 Professional @ PHP 299 = PHP 5,980/mo
- 8 Premium @ PHP 599 = PHP 4,792/mo
- 2 Practice @ PHP 1,499 = PHP 2,998/mo
- **Total: PHP 13,770/month = PHP 165,240/year**

**Year 1 Optimistic (with viral growth):**

- 500 therapists (40% paid = 200, higher conversion as word spreads)
- 120 Professional @ PHP 299 = PHP 35,880/mo
- 60 Premium @ PHP 599 = PHP 35,940/mo
- 20 Practice @ PHP 1,499 = PHP 29,980/mo
- **Total: PHP 101,800/month = PHP 1,221,600/year**

**Note:** Lower absolute revenue but more sustainable for Philippines market. Focus on volume and retention.---

## Go-To-Market Strategy

### Phase 1: Therapist Acquisition (Months 1-3) - Philippines Focus

**Target:** 50-100 therapists**Channels:**

1. **Facebook Groups** (Primary Channel - Philippines)

- Join Filipino OT/Speech therapist groups
- Share value proposition: "Save 2-3 hours/week on documentation"
- Offer generous free tier (10 clients, 50 sessions/month)
- Post success stories
- Engage in group discussions, provide value first

2. **Facebook Pages & Communities**

- Create TherapyNotes Philippines Facebook page
- Join parent support groups (indirect marketing)
- Share helpful content: "How to document therapy sessions faster"
- English content

3. **Local Therapist Associations**

- Philippine Association of Speech Pathologists (PASP)
- Occupational Therapy Association of the Philippines (OTAP)
- Attend local conferences/events
- Offer free workshops on documentation

4. **Direct Outreach**

- Find therapists on Facebook (more common than LinkedIn in PH)
- Messenger outreach: "I built a tool that saves therapists 2-3 hours/week"
- Offer free onboarding call/video demo
- Personal touch works better than email

5. **Content Marketing**

- Blog: "How to Document Therapy Sessions Faster"
- YouTube: "5-Minute Session Documentation"
- SEO: "therapy notes app Philippines", "OT documentation software PH"
- TikTok/Reels: Quick tips for therapists

**Key Message:** "Document sessions in 5 minutes, not 30. Show parents real progress."

### Phase 2: Viral Growth Engine (Months 3-6)

**Therapist → Parent → Therapist Loop:**

1. **Therapist invites parent** (already built)
2. **Parent sees value** (progress, activities, milestones)
3. **Parent shares with other parents** (in support groups, Facebook)
4. **Other parents ask their therapist:** "Why don't you use TherapyNotes?"
5. **New therapist signs up** (viral loop)

**Mechanisms:**

- **Share buttons** in parent portal: "Share progress with family"
- **Milestone celebrations** (auto-post to Facebook with permission - huge in PH)
- **Referral program:** Therapist gets 1 month free for each referral
- **Parent testimonials:** "This app changed how I see my child's progress"
- **GCash/PayMaya/PayPal integration:** Easy payment for Filipino users (most popular payment methods)

**Target:** 200-500 therapists by month 6

### Phase 3: Network Effects (Months 6-12)

**Therapist → Therapist Network:**

- **Template marketplace:** Therapists share custom templates
- **Community forum:** Therapists help each other
- **Success stories:** "How Sarah saved 10 hours/week"

**Parent → Parent Network:**

- **Parent support groups:** Built into app (Facebook integration)
- **Activity sharing:** Parents share successful home activities
- **Progress comparisons:** (anonymized) "Kids like yours typically..."

**Target:** 500-1000 therapists by month 12**Philippines-Specific Considerations:**

- **Payment Methods:** GCash, PayMaya (Maya), PayPal, credit cards
- **Language:** English
- **Internet:** Optimize for slower connections, mobile-first
- **Support:** English support
- **Pricing Display:** Show in PHP (Philippine Peso) only

---

## Value Maximization Features

### For Therapists (Time Savings = Money)

1. **Quick Entry Mode** (Mobile-First)

- 30-second session summary
- Voice-to-text notes (Premium)
- Photo snap → auto-attach
- Template shortcuts

2. **Smart Templates**

- AI-suggested activities based on goals
- Copy from previous session
- Pre-filled common observations

3. **Batch Operations**

- Document multiple sessions at once
- Bulk share with parents
- Export all reports for insurance

4. **Time Tracking**

- Auto-calculate billable hours
- Export for invoicing
- Session reminders

### For Parents (Engagement = Retention)

1. **Progress Dashboard** (Visual)

- Charts showing improvement over time
- Goal completion percentages
- Milestone celebrations (confetti!)

2. **Home Activity Feed**

- Daily suggestions based on session
- Video tutorials (link to YouTube)
- Progress tracking: "3/5 activities done this week"

3. **Weekly Digest Email**

- Auto-generated summary
- "This week your child..."
- Upcoming goals

4. **Question Box**

- Parents ask questions async
- Therapist responds when convenient
- Reduces phone calls by 80%

5. **Milestone Feed** (Instagram-like)

- "Sarah completed her first puzzle!"
- Shareable moments
- Builds emotional connection

### For Both (Network Effects)

1. **Family Sharing**

- Invite grandparents (read-only)
- Everyone sees progress
- Reduces "How's my kid?" calls

2. **IEP Reports**

- Auto-generate from sessions
- Professional format
- Export for meetings

3. **Insurance Documentation**

- Progress reports
- Session summaries
- Goal tracking

---

## Implementation Roadmap

### Month 1: Foundation (Current State)

- ✅ Therapist dashboard
- ✅ Parent portal (read-only)
- ✅ Basic templates
- ✅ Session documentation
- ✅ MFA authentication
- ✅ Role-based access control

**MVP Security (Must Complete Before Launch - Week 1):**

- [ ] Verify HTTPS/TLS enabled (check hosting provider)
- [ ] Enable MongoDB encryption at rest (Atlas dashboard or config)
- [ ] Update S3StorageService.cs to use AES-256 encryption
- [ ] Enable S3 bucket default encryption (provider dashboard)
- [ ] Test encryption (upload file, verify it's encrypted)

**Time Estimate:** 2-4 hours**Cost:** $0-50/month

### Month 2: Value Features

- [ ] **Quick Entry Mode** (mobile-optimized)
- [ ] **Progress Dashboard** (visual charts)
- [ ] **Weekly Digest Email** (auto-generated)
- [ ] **Home Activity Feed** (enhanced)
- [ ] **Milestone Celebrations** (confetti animations)

### Month 3: Viral Mechanisms

- [ ] **Share buttons** (parent portal)
- [ ] **Referral program** (therapist gets free month)
- [ ] **Parent testimonials** (landing page)
- [ ] **Social sharing** (milestone posts)

### Month 4: Network Effects

- [ ] **Template marketplace** (therapists share templates)
- [ ] **Question Box** (async parent-therapist communication)
- [ ] **Family sharing** (grandparents, etc.)
- [ ] **Community forum** (therapist discussions)

### Month 5-6: Advanced Features

- [ ] **Voice-to-text** (OpenAI Whisper integration)
- [ ] **AI suggestions** (activity recommendations)
- [ ] **Time tracking** (billable hours)
- [ ] **Practice tier** (multi-therapist support)

---

## Key Success Metrics

### Therapist Metrics

- **Sign-ups:** Target 100 therapists/month by month 3
- **Conversion:** 40-50% free → paid
- **Retention:** 85%+ monthly retention
- **Time saved:** Average 2-3 hours/week per therapist

### Parent Metrics

- **Activation:** 70%+ parents log in within 7 days
- **Engagement:** 3+ logins per week
- **Viral coefficient:** 0.3+ (each therapist brings 0.3 new therapists via parents)

### Business Metrics (Philippines Market)

- **MRR:** PHP 10,000/month by month 3, PHP 50,000/month by month 6
- **CAC:** <PHP 200 per therapist - organic growth via Facebook
- **LTV:** PHP 3,588+ (Professional) to PHP 7,188+ (Premium) - 12+ month retention
- **Churn:** <8% monthly (higher than US due to price sensitivity, but manageable)
- **Conversion:** 30-40% free → paid (lower than US, but acceptable at this price point)

---

## Competitive Advantages

1. **Mobile-First:** Therapists can document during sessions
2. **Parent Engagement:** No competitor focuses on parent value
3. **Viral Growth:** Parents become acquisition channel
4. **Affordable:** PHP 299/month (~$5.25) vs PHP 5,000+/month for international EHRs
5. **Specialized:** Built for OT/Speech, not generic healthcare
6. **Secure by Default:** Encryption at rest/transit implemented
7. **Philippines-Focused:** Generous free tier, local payment methods (GCash/PayMaya/PayPal), Facebook integration

---

## Risks & Mitigations

**Risk:** Therapists don't see value quickly**Mitigation:** Free tier with clear upgrade prompts, onboarding calls**Risk:** Parents don't engage**Mitigation:** Weekly digest emails, milestone celebrations, easy mobile access**Risk:** Competition from established EHRs**Mitigation:** Focus on speed and parent engagement (their weakness)**Risk:** Low conversion from free to paid (price sensitivity in Philippines)**Mitigation:** Generous free tier builds trust, show clear value before upgrade prompts, offer annual discounts (save 20%)**Risk:** Payment method friction (credit cards less common)**Mitigation:** Integrate GCash, PayMaya, and PayPal from day one (most popular payment methods in Philippines)**Risk:** Security breaches (data exposure, loss of trust)**Mitigation:** Implement encryption at rest/transit before launch---

## Security Implementation: Encryption at Rest & In Transit

**Focus:** Basic security essentials - encryption at rest and in transit to protect user data.**Why This Approach:**

- Gets you to market faster
- Provides essential security protection
- Industry-standard encryption practices
- Can be enhanced later without major refactoring

### Encryption in Transit (HTTPS/TLS)

**Status:** ✅ Likely already handled by hosting provider**What to Verify:**

- Hosting provider (Railway/AWS/Azure) automatically provides HTTPS
- API endpoints use HTTPS (not HTTP)
- Frontend uses HTTPS
- WebSocket connections use WSS (if applicable)

**Action Items:**

- [ ] Verify HTTPS is enabled on production domain
- [ ] Force HTTPS redirects (no HTTP access)
- [ ] Check TLS version (should be 1.2+)
- [ ] Test SSL Labs SSL Test (should get A rating)

**Cost:** $0 (handled by hosting provider)

### Encryption at Rest

**Status:** ❌ Needs implementation

#### 1. Database Encryption (MongoDB)

**Option A: MongoDB Atlas (Recommended for Launch)**

- MongoDB Atlas provides encryption at rest automatically
- Just enable it in Atlas dashboard
- No code changes needed

**Option B: Self-Hosted MongoDB**

- Enable encryption at rest in MongoDB config
- Requires encryption key management
- More complex, not recommended for MVP

**Implementation Steps:**

1. **If using MongoDB Atlas:**

- Go to Atlas cluster settings
- Enable "Encryption at Rest" (usually enabled by default)
- Verify encryption is active

2. **If self-hosting:**

- Configure MongoDB with WiredTiger encryption
- Set up key management (AWS KMS, Azure Key Vault, etc.)
- Update MongoDB config file

**Code Changes:** None needed if using Atlas**Cost:**

- Atlas: Included in paid tiers (M10+)
- Self-hosted: $0-50/month for key management

#### 2. Storage Encryption (S3-Compatible)

**Current Code:** `S3StorageService.cs` doesn't specify encryption**What to Add:**

- Server-side encryption (SSE) for all uploads
- Use AES-256 encryption (standard)

**Implementation:**Update `S3StorageService.cs` to enable encryption:

```csharp
var putRequest = new PutObjectRequest
{
    BucketName = _bucketName,
    Key = fileKey,
    InputStream = fileStream,
    ContentType = contentType,
    ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256  // ADD THIS
};
```

**Bucket-Level Encryption:**

- AWS S3: Enable default encryption on bucket (AES-256)
- Cloudflare R2: Encryption enabled by default
- MinIO: Enable encryption in bucket policy

**Code Changes Required:**

- [ ] Update `S3StorageService.cs` to add `ServerSideEncryptionMethod = AES256`
- [ ] Configure bucket default encryption (via provider dashboard)

**Cost:** $0 (included in S3/R2 pricing)

### MVP Security Checklist (Pre-Launch)

**Encryption in Transit:**

- [ ] Verify HTTPS enabled on production
- [ ] Force HTTPS redirects
- [ ] Test SSL certificate (SSL Labs)

**Encryption at Rest:**

- [ ] Enable MongoDB encryption (Atlas or self-hosted)
- [ ] Update S3StorageService to use AES-256 encryption
- [ ] Enable bucket default encryption
- [ ] Test file upload/download with encryption

**Total Implementation Time:** 2-4 hours**Total Cost:** $0-50/month (if using Atlas paid tier)---

## Next Steps (Immediate Actions)

1. **MVP Security (Before Launch - Week 1):**

- Verify HTTPS/TLS enabled (hosting provider)
- Enable MongoDB encryption at rest (Atlas or config)
- Update S3StorageService to use AES-256 encryption
- Enable S3 bucket default encryption
- Test encryption end-to-end

2. **Update pricing** to $29/$59/$199 tiers
3. **Build Quick Entry Mode** (mobile-first session logging)
4. **Add Progress Dashboard** (visual charts for parents)
5. **Implement Weekly Digest Email** (auto-generated summaries)
6. **Create landing page** with therapist-focused messaging + "Secure" badge
7. **Set up referral program** (therapist gets free month)
8. **Launch in 2-3 Facebook groups** (OT/Speech therapist communities)