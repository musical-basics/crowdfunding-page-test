-- Update risks and shipping for 'dreamplay-one' campaign
UPDATE cf_campaign
SET 
  risks = '<h3 class="text-2xl font-bold">Risks & Challenges</h3>
<p class="text-base leading-relaxed text-foreground">
  Hardware is hard, but we have prepared for it. We are entering this campaign with a working prototype and a manufacturing partner selected. However, looking toward our August 2026 delivery, here are the primary variables:
</p>

<div class="space-y-4 mt-4">
  <div>
    <h4 class="text-lg font-semibold">1. The "Tooling" Phase (Months 1-3)</h4>
    <p class="text-base text-muted-foreground">
      The most time-consuming part of this process is creating the steel molds for the chassis and keys. This takes roughly 90 days. We cannot speed this up without risking quality.
    </p>
  </div>

  <div>
    <h4 class="text-lg font-semibold">2. Freight & Logistics</h4>
    <p class="text-base text-muted-foreground">
      Global shipping is volatile. While we aim to ship in August, ocean freight delays (port congestion, customs) can sometimes add 2-4 weeks to delivery times.
    </p>
  </div>

  <div>
    <h4 class="text-lg font-semibold">3. Our Promise</h4>
    <p class="text-base text-muted-foreground">
      We adhere to the <strong>"Update Rule"</strong>: You will receive a production update from me every single month, whether the news is good or bad. You will see photos of the molds, the first units off the line, and the boxes on the pallets.
    </p>
  </div>
</div>',
  shipping = '<p>We ship worldwide! Estimated delivery: August 2026.</p><p><strong>Shipping is calculated at checkout based on weight and distance. International backers are responsible for local customs/VAT duties.</strong></p>'
WHERE id = 'dreamplay-one';
