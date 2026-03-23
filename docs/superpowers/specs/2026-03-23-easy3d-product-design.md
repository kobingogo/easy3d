# easy3d Product Design

**Date:** 2026-03-23
**Status:** Draft approved for spec review
**Owner:** Codex + user

## 1. Goal

Reposition `easy3d` from an AI capability showcase into a narrowly scoped workflow product for small and medium ecommerce sellers, with commercial validation as the primary goal and portfolio value as a strong secondary goal.

The new direction should avoid competing head-on as a generic AI 3D platform. Instead, it should stay aligned with Tripo's core generation experience while focusing on the seller workflow around repeated asset production.

## 2. Product Direction

### 2.1 Primary business objective

The next 2-3 months should prioritize:

1. Getting real target users to complete a useful workflow end to end
2. Converting some of those users into early paid usage
3. Preserving enough technical depth and product coherence to serve as a strong career portfolio piece

### 2.2 Strategic positioning

`easy3d` should be positioned as:

> An AI product asset production workbench for ecommerce sellers that helps them turn product photos into platform-ready asset packs faster than traditional photo/design workflows.

This is intentionally different from:

- A generic "AI 3D generation playground"
- A pure "frontend AI demo"
- A heavy professional 3D editing tool

### 2.3 Repositioning statement

The product should no longer lead with:

> "AI+3D product generation platform"

It should instead lead with:

> "A workflow tool for producing multi-platform product asset packs for small sellers"

AI and 3D remain enabling technology, but they should not be the headline category in the market-facing narrative.

## 3. Current State Assessment

### 3.1 What is already implemented

The current codebase already contains meaningful foundations:

1. Core 3D generation flow
   - Single-image and multiview upload
   - Tripo task creation and status polling
   - Model download flow
   - Key files:
     - `app/generate/page.tsx`
     - `app/api/generate-smart/route.ts`
     - `lib/tripo/index.ts`
     - `components/upload/MultiViewUploadZone.tsx`

2. AI-enhanced generation pipeline
   - Product analysis from uploaded image
   - Prompt optimization before Tripo generation
   - Structured analysis output for category, style, materials, features

3. RAG knowledge system
   - Knowledge retrieval and Q&A
   - Search, stats, references, evaluation support
   - Strong benchmark results documented in PRD and backlog

4. Agent workflow foundation
   - Planner, workflow engine, tool registry, SSE thought streaming
   - Existing tools for product analysis, prompt optimization, generation, copy, export, quality check

5. Partial ecommerce utility layer
   - Platform image adaptation configuration exists
   - Platform-specific copywriting tool exists
   - Product-oriented vocabulary and platform-aware knowledge structure exist

6. Blender optimization sidecar
   - Model optimization and rendering service exists as future leverage

### 3.2 What is not yet product-complete

The codebase has more capability than the current UX exposes, but several parts are still "capability present" rather than "product workflow complete":

1. Multi-platform export appears implemented at the utility level, but not yet clearly exposed as a polished seller workflow
2. Copywriting exists as an agent tool, but not yet as a strong result-page experience for sellers
3. Agent is currently framed as a technical demonstration rather than a seller-facing automation workflow
4. Homepage and README still carry "AI engineer showcase" language that weakens product clarity
5. Batch workflows, template workflows, billing, and user operations are not yet productized

### 3.3 Document consistency notes

The documents are directionally correct but not fully aligned with the lived product:

- `docs/PRD-v3.0.md` correctly shifts the product toward ecommerce sellers
- `docs/DEV-BACKLOG.md` marks more items as complete than are clearly reflected in end-user workflow UX
- `README.md` still describes the product as an engineer showcase platform

Implementation planning should therefore be based on actual workflow completeness, not only on checklist completion labels.

## 4. User and Market Focus

### 4.1 Core target users

Primary target users:

1. Small and medium ecommerce sellers
   - Taobao/Tmall store owners
   - Xiaohongshu commerce sellers
   - Douyin commerce sellers

2. Secondary target users
   - Small creator teams doing commerce content
   - Boutique agencies producing product assets for merchants

### 4.2 Workflow jobs to be done

The product should focus on these jobs:

1. Turn product photos into better-looking 3D-ready visual assets quickly
2. Produce platform-ready output sizes with minimal repeated work
3. Reuse brand-consistent presentation styles across product batches
4. Generate supporting copy and packaging for content publishing

### 4.3 Narrow wedge

The initial wedge should be:

1. Small sellers or small studios
2. Repeated product listing and content production
3. Need for "good enough, fast, reusable, multi-platform" output

The product is not initially optimized for:

1. Enterprise asset management
2. Advanced 3D editing professionals
3. Generic creator experimentation

## 5. Category Focus Strategy

### 5.1 Early category selection principle

Early product-market validation should focus on categories that are more likely to produce good-looking results with today's AI+3D stack, especially with Tripo-based generation and limited post-editing.

### 5.2 Recommended early categories

Launch priority:

1. Phase 1 primary category:
   - Bags and small leather goods
2. Phase 1.5 or Phase 2 secondary category:
   - Shoes and sneakers
3. Later expansion categories:
   - Beauty packaging
   - 3C accessories
   - Small home/lifestyle objects

Phase 1 validation scope is limited to bags and small leather goods only. Shoes and sneakers are the next planned expansion, but they are not part of the first validation slice.

Rationale for primary launch category:

1. Bags and small leather goods have strong silhouette stability
2. Premium texture is relatively easy to emphasize
3. They fit both ecommerce listing and Xiaohongshu content scenarios
4. They are more forgiving than soft apparel while still visually aspirational

Recommended first-wave categories beyond the primary wedge:

1. Bags and small leather goods
   - Strong silhouette
   - Clear structure
   - Easy to perceive premium texture
   - Good fit for Xiaohongshu and Taobao

2. Shoes and sneakers
   - Structured geometry
   - Multiview benefits are clear
   - Strong ecommerce and content-display value

3. Beauty packaging
   - Lipstick tubes, perfume bottles, skincare bottles, compact cases
   - High visual payoff for lighting/material optimization
   - Good match for content marketing workflows

4. 3C accessories
   - Phone cases, headphones cases, stands, keyboards, mice
   - Structured objects with repeatable templates
   - Strong fit for batch workflows

5. Small home/lifestyle objects
   - Cups, diffusers, desktop decor, storage objects
   - Good for template-based scene production

### 5.3 Deprioritized early categories

These should not be the first commercial focus:

1. Dresses and flowing apparel
2. Loose garments with soft-body motion expectations
3. Highly deformable textile products
4. Products where drape, flutter, try-on realism, or motion beauty is the main selling point

Reason:

- Current AI+3D workflows struggle more with cloth dynamics, soft-body realism, and natural "movement beauty"
- Sellers in those categories may judge results against difficult aesthetic expectations
- Failure risk is higher, which is dangerous for early paid validation

This does not mean apparel is impossible long term. It means it should be a later expansion area after structured-category workflows are strong.

## 6. Competitive Product Shape

### 6.1 Where to align with Tripo

The product should match or approach Tripo on:

1. Fast image-to-3D generation
2. Multiview input support
3. Reasonable preview and model download
4. Stable generation workflow
5. Simplicity of the core "upload -> generate -> get result" loop

### 6.2 Where to differentiate from Tripo

The product should differentiate through seller workflow value, not through trying to beat Tripo at pure foundation-model quality.

Recommended differentiated capabilities:

1. Brand consistency template system
2. Ecommerce platform asset pack output
3. AI display strategy guidance

### 6.3 Direct competitive lane to avoid

The product should avoid competing primarily as:

1. A generic text/image-to-3D platform
2. A broad AI product photography studio
3. A full publishing platform

Those lanes are either too crowded, too infrastructure-heavy, or too dependent on downstream integrations for an early-stage product.

## 7. Differentiated Capabilities

### 7.1 Capability 1: Brand consistency templates

Users can save and reapply reusable presentation strategies across products:

- Preferred platform targets
- Lighting and scene style presets
- Background and composition rules
- Material emphasis preferences
- Copy tone presets
- Category-specific output recipes

User value:

- Faster repeatable production
- Better brand consistency
- More reason to pay and return

Phase boundary:

1. Phase 1 ships only fixed, category-specific presets for bags and small leather goods
2. Those Phase 1 presets are internal generation recipes, not user-editable templates
3. Users cannot save, edit, or reuse their own templates in Phase 1
4. Phase 2 introduces editable and reusable saved templates
5. Full brand-level preset management belongs to Phase 2, not the MVP

### 7.2 Capability 2: Platform-ready asset pack output

Instead of returning only a 3D model, the product should return a seller-ready package:

- Taobao main image
- Xiaohongshu cover image
- Douyin vertical visual
- Suggested copy by platform
- Suggested tags/angles
- Downloadable grouped asset set

User value:

- Much closer to a real seller outcome
- Easier to justify payment than model-only output

### 7.3 Capability 3: AI display strategy guidance

Before or after generation, the product should explain:

- Which platform is best suited for this product
- Which scene/style directions are likely to work
- What features should be highlighted in the first image
- What angle, material emphasis, or marketing hook should be prioritized

This capability should use RAG + Agent to turn the system into a product decision assistant, not only a generation executor.

User value:

- More trust
- Better outcomes for non-expert sellers
- Strong portfolio value for the builder

## 8. Recommended Product Scope

### 8.1 Recommended product route

Recommended route:

> "Workflow-vertical asset production first, light content workflow second"

That means:

1. The main product is a seller asset production workbench
2. The first commercial promise is repeated workflow efficiency, not raw generation novelty
3. Content workflow support exists, but only where it directly improves conversion and seller usefulness
4. Full platform publishing integrations are not MVP-critical

### 8.2 Recommended market-facing packaging

The product should be introduced in three progressively deeper messages:

1. Entry message:
   - "Upload product photos and get a platform-ready asset pack"
2. Workflow message:
   - "Batch-produce assets for repeated product launches"
3. Retention message:
   - "Save templates and keep brand consistency across products"

### 8.3 Explicit non-goals for MVP

Do not make these MVP centerpieces:

1. Full OAuth publishing to every platform
2. Heavy web-based 3D editor
3. Apparel-first production strategy
4. Multi-role enterprise collaboration
5. Overbuilt marketplace/platform integration layer

## 9. Product Architecture

### 9.1 Product layers

The product should be designed in three layers:

1. Core generation layer
   - Upload
   - Analyze
   - Prompt optimize
   - Generate with Tripo
   - Preview/download

2. Seller workflow layer
   - Platform output packaging
   - Copy generation
   - Result organization
   - Batch job handling
   - Template reuse

3. Strategy and automation layer
   - RAG recommendations
   - Agent workflows
   - Quality checks
   - Later-stage Blender optimization

### 9.2 Core user flow

The desired primary user flow:

1. User enters a launch workflow, not a generic generation playground
2. User uploads one or more product images
3. System analyzes product and suggests the best output route
4. User selects one fixed bag/leather-goods preset in Phase 1; saved templates and brand presets arrive in Phase 2
5. System generates the 3D-enhanced result
6. System outputs a platform-ready asset pack and copy
7. User previews, downloads, and reuses settings for the next product

## 10. Phased Roadmap

### Phase 1: Sellable MVP

Goal:

Make a single seller finish one useful workflow and feel comfortable paying for it.

Must-have outcomes:

1. Clear homepage and product narrative for sellers
2. End-to-end workflow polished around one repeated seller task
3. Result page with platform-ready assets and copy
4. Simple download packaging
5. Basic usage gating for trial vs paid usage

Recommended Phase 1 gating model:

1. Free trial:
   - One complete generation workflow
   - Preview available
   - Watermarked or reduced-coverage result package
2. Paid single-use tier:
   - Full-resolution asset pack download
   - All platform outputs in the MVP package
   - Copy pack included
3. No subscription system is required for the first validation slice if it slows shipping; single-order payment is acceptable for early validation
4. Recommended paid gate mechanism:
   - User can complete generation and see the result preview for free
   - User must pay to unlock the full launch-ready asset pack download
   - Phase 1 planning should assume manual order confirmation or a very lightweight single-payment flow, not a full subscription or billing system

Phase 1 positioning rule:

1. Users should understand the product as "asset pack generation for repeated listing workflows"
2. Users should not need to understand 3D terminology to get value
3. The workflow should feel closer to "launch my product assets" than "create a 3D model"

### Phase 2: Main-axis differentiation

Goal:

Make the product feel better than generic generation tools for seller workflows.

Must-have outcomes:

1. Template system
2. Brand consistency presets
3. Batch upload and batch generation
4. Queue/task organization

Phase 2 should be the true center of gravity for the product. This is where competition pressure should drop, because the product stops being a single-output generator and becomes a repeated-workflow tool.

### Phase 3: Content workflow expansion

Goal:

Support creator-style marketing use cases without overextending the platform.

Must-have outcomes:

1. Xiaohongshu/Douyin-oriented copy packs
2. Cover/title suggestions
3. Platform-specific angle/tag recommendations
4. "Publishing prep" experience, not necessarily full direct publish

## 10.1 MVP asset pack definition

For Phase 1, "platform-ready asset pack" should mean a concrete and limited package, not an open-ended export concept.

Required contents:

1. Original generated 3D model download link
2. One Taobao main image export
3. One Xiaohongshu cover image export
4. One Douyin vertical image export
5. One platform-specific copy pack:
   - Xiaohongshu title + body + tags
   - Taobao title + selling points
   - Douyin hook + short script + tags
6. One lightweight AI strategy summary:
   - Recommended hero angle
   - Recommended target platform
   - Recommended style or scene direction

Not required in Phase 1:

1. Editable PSD-like layered assets
2. Direct publishing APIs
3. Full batch ZIP management for large teams

The market-facing description should refer to this as:

> "A launch-ready asset pack"

not as:

> "export formats"

because users buy outcomes, not file semantics.

## 10.2 Preset and template boundary

To avoid scope confusion, the boundary between MVP presets and later templates is:

| Capability | Phase 1 MVP | Phase 2 |
|------------|-------------|---------|
| Fixed category presets | Yes | Yes |
| User-editable presets | No | Yes |
| User-saved reusable templates | No | Yes |
| Brand-level preset management | No | Yes |

### Phase 4: Stronger moat and portfolio value

Goal:

Strengthen technical differentiation and narrative quality for long-term product value and career leverage.

Must-have outcomes:

1. Agent-based automated workflows
2. Strategy recommendation engine
3. Optional Blender post-processing
4. Quality metrics and showcaseable system observability

## 11. Success Metrics

### 11.1 Product metrics

Key near-term metrics:

1. Generate success rate
2. Generate-to-download conversion
3. Download-to-repeat-use rate
4. Trial-to-paid conversion
5. Time-to-first-useful-output

Phase 1 target thresholds:

1. Time to first useful asset pack: under 10 minutes for a new user with one product
2. Generate-to-download conversion: at least 30%
3. First 5 target interviews: at least 3 users say the exported package is more valuable than the raw 3D model alone

### 11.2 User validation metrics

Key proof points:

1. A seller can produce usable assets in under 10 minutes
2. At least one target category gets consistent positive feedback
3. Users value output package completeness, not only model generation
4. Users describe the workflow as time-saving for repeated launches, not just visually impressive

### 11.3 Career leverage metrics

The system should also demonstrate:

1. Multi-model orchestration
2. AI-enhanced workflow design
3. Retrieval + agent + generation integration
4. Product prioritization discipline

## 12. Risks and Mitigations

### 12.1 Technical risk

Risk:
Tripo output quality varies by category.

Mitigation:
Constrain early category scope to structured products and build category-aware templates.

### 12.2 Product risk

Risk:
The product remains a "cool demo" rather than a workflow tool.

Mitigation:
Prioritize result packaging, repeat workflows, and seller outcomes over extra AI features.

### 12.3 Scope risk

Risk:
Trying to do publishing integrations, editing, batching, and monetization all at once.

Mitigation:
Use a strict phased roadmap and keep MVP centered on one seller completing one valuable workflow.

## 13. Planning Boundary

This spec is intentionally scoped to one product direction and one roadmap system. It should lead to a single implementation planning effort focused on:

1. Repositioning the product narrative around workflow efficiency
2. Polishing the MVP workflow
3. Adding the first differentiated seller capabilities
4. Establishing the product around repeated asset production, not generic generation

It should not expand into separate independent planning tracks for enterprise collaboration, marketplace ecosystems, or advanced editor products at this stage.
