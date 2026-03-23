# easy3d Product Design

**Date:** 2026-03-23
**Status:** Draft approved for spec review
**Owner:** Codex + user

## 1. Goal

Reposition `easy3d` from an AI capability showcase into an AI+3D product workflow tool for small and medium ecommerce sellers, with commercial validation as the primary goal and portfolio value as a strong secondary goal.

The product should stay aligned with Tripo's core 3D generation experience while building 1-3 differentiated capabilities that are more useful for real seller workflows than a generic 3D generation API wrapper.

## 2. Product Direction

### 2.1 Primary business objective

The next 2-3 months should prioritize:

1. Getting real target users to complete a useful workflow end to end
2. Converting some of those users into early paid usage
3. Preserving enough technical depth and product coherence to serve as a strong career portfolio piece

### 2.2 Strategic positioning

`easy3d` should be positioned as:

> An AI 3D asset workflow tool for ecommerce sellers that helps them turn product photos into platform-ready marketing assets faster than traditional photo/design workflows.

This is intentionally different from:

- A generic "AI 3D generation playground"
- A pure "frontend AI demo"
- A heavy professional 3D editing tool

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

## 5. Category Focus Strategy

### 5.1 Early category selection principle

Early product-market validation should focus on categories that are more likely to produce good-looking results with today's AI+3D stack, especially with Tripo-based generation and limited post-editing.

### 5.2 Recommended early categories

Recommended first-wave categories:

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

> "Asset production workbench first, light content workflow second"

That means:

1. The main product is a seller asset workbench
2. Content workflow support exists, but only where it directly improves conversion and seller usefulness
3. Full platform publishing integrations are not MVP-critical

### 8.2 Explicit non-goals for MVP

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

1. User chooses category-friendly workflow
2. User uploads one or more product images
3. System analyzes product and suggests best presentation route
4. User selects a template or brand preset
5. System generates 3D result
6. System outputs platform-ready asset pack and copy
7. User previews, downloads, and reuses settings for the next product

## 10. Phased Roadmap

### Phase 1: Sellable MVP

Goal:

Make a single seller finish one useful workflow and feel comfortable paying for it.

Must-have outcomes:

1. Clear homepage and product narrative for sellers
2. End-to-end generation workflow polished
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

### Phase 2: Main-axis differentiation

Goal:

Make the product feel better than generic generation tools for seller workflows.

Must-have outcomes:

1. Template system
2. Brand consistency presets
3. Batch upload and batch generation
4. Queue/task organization

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

1. Repositioning the product narrative
2. Polishing the MVP workflow
3. Adding the first differentiated seller capabilities

It should not expand into separate independent planning tracks for enterprise collaboration, marketplace ecosystems, or advanced editor products at this stage.
