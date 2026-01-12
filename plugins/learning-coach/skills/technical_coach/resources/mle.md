# ML System Design Guide

## Overview

ML System Design focuses on designing **end-to-end machine learning systems** that can be deployed in production. Unlike traditional system design, ML system design emphasizes data pipelines, feature engineering, model development, and the iterative nature of ML workflows.

### Key Differences from Traditional System Design

| Aspect | Traditional (SWE) | ML System Design |
|--------|------------------|------------------|
| **Core Focus** | Components, APIs, databases | Data, features, models |
| **Iteration** | Deploy once, maintain | Continuous retraining, A/B testing |
| **Metrics** | Latency, availability | Precision, recall, business metrics |
| **Debugging** | Stack traces, logs | Model interpretability, drift detection |
| **Testing** | Unit tests, integration | Offline evaluation, online experiments |

---

## Common ML System Design Problems

| # | Problem | Category | Key Challenge |
|---|---------|----------|---------------|
| 1 | **Visual Search System** | Search & Ranking | Image embeddings, similarity matching |
| 2 | **Google Street View Blurring** | Computer Vision | Face/license plate detection at scale |
| 3 | **YouTube Video Search** | Search & Ranking | Multi-modal search (text, video, audio) |
| 4 | **Harmful Content Detection** | Content Moderation | Multi-label classification, policy enforcement |
| 5 | **Video Recommendation System** | Recommendations | Two-stage (retrieval + ranking), freshness |
| 6 | **Event Recommendation System** | Recommendations | Location-based, time-sensitive, cold start |
| 7 | **Ad Click Prediction** | Ads & Ranking | CTR prediction, real-time bidding |
| 8 | **Similar Listings** | Search & Ranking | Item embeddings, personalization |
| 9 | **Personalized News Feed** | Recommendations | Ranking, diversity, freshness |
| 10 | **People You May Know** | Social | Graph-based, privacy considerations |

---

## The 9-Step ML System Design Framework

Use this framework flexibly - you may spend more time on certain steps depending on the problem. The key is demonstrating structured thinking and awareness of the full ML lifecycle.

```
+------------------+     +------------------+     +---------------------+
| 1. Problem       | --> | 2. Metrics       | --> | 3. Architecture     |
|    Formulation   |     |    Definition    |     |    Components       |
+------------------+     +------------------+     +---------------------+
         |                                                   |
         v                                                   v
+------------------+     +------------------+     +---------------------+
| 4. Data          | --> | 5. Feature       | --> | 6. Model            |
|    Collection    |     |    Engineering   |     |    Development      |
+------------------+     +------------------+     +---------------------+
         |                                                   |
         v                                                   v
+------------------+     +------------------+     +---------------------+
| 7. Prediction    | --> | 8. Online        | --> | 9. Scaling,         |
|    Service       |     |    Testing       |     |    Monitoring       |
+------------------+     +------------------+     +---------------------+
```

---

## Step 1: Problem Formulation

**Goal:** Translate the business problem into a well-defined ML task.

### Instructions for Interviewer Role
1. Present the problem briefly (1-2 sentences)
2. Ask: *"How would you formulate this as an ML problem?"*
3. Guide toward identifying the task type and ML objective

### Key Questions to Address

| Question | Why It Matters |
|----------|----------------|
| What is the business objective? | Aligns ML goal with business value |
| Is ML necessary? | Sometimes rules/heuristics are better |
| What type of ML task is this? | Determines model architecture |
| What is the prediction target? | Defines what we're optimizing for |

### ML Task Types

| Task Type | When to Use | Examples |
|-----------|-------------|----------|
| **Binary Classification** | Yes/no decisions | Spam detection, click prediction |
| **Multi-class Classification** | One label from many | Content categorization |
| **Multi-label Classification** | Multiple labels | Harmful content detection |
| **Ranking** | Order items | Search results, recommendations |
| **Regression** | Predict continuous value | Time-to-click, price prediction |
| **Retrieval** | Find similar items | Visual search, recommendations |

### Example Formulation

**Problem:** "Design a video recommendation system"

**ML Formulation:**
- **Business Objective:** Increase user engagement (watch time, retention)
- **ML Task:** Ranking (score videos by predicted engagement)
- **Prediction Target:** P(user watches video for > 30 seconds)

**Checkpoint:** *"Does this formulation align with the business goal? Ready to define metrics?"*

---

## Step 2: Metrics Definition

**Goal:** Define how to measure success both offline (during development) and online (in production).

### Offline Metrics

Choose based on task type:

| Task Type | Common Metrics | When to Use |
|-----------|---------------|-------------|
| **Classification** | Precision, Recall, F1, AUC-ROC, AUC-PR | Imbalanced classes: use Precision-Recall |
| **Ranking** | NDCG, MRR, MAP, Precision@K | NDCG for graded relevance |
| **Regression** | MSE, RMSE, MAE, MAPE | MAE more robust to outliers |
| **Retrieval** | Recall@K, Precision@K | Recall@K for candidate generation |

### Online Metrics

| Category | Metrics | What They Measure |
|----------|---------|-------------------|
| **Engagement** | CTR, Watch Time, Session Duration | User interest |
| **Retention** | DAU/MAU, Return Rate | Long-term value |
| **Business** | Revenue, Conversions, LTV | Direct business impact |
| **Quality** | User Reports, Diversity, Freshness | User experience |

### Metric Alignment

Ask: *"How do offline metrics correlate with online success?"*

| Issue | Description | Solution |
|-------|-------------|----------|
| **Metric Mismatch** | High offline AUC but low online CTR | Better align training objective |
| **Overfitting to Metric** | Gaming the metric | Use multiple complementary metrics |
| **Short-term vs Long-term** | High CTR but low retention | Include long-term metrics |

**Checkpoint:** *"Are our metrics aligned with business objectives? Ready to design the architecture?"*

---

## Step 3: Architectural Components

**Goal:** Design the high-level system architecture showing ML and non-ML components.

### Typical ML System Architecture

```
+-------------+     +---------------+     +------------------+
|   Clients   | --> | API Gateway   | --> | Prediction       |
| (Web/Mobile)|     | (Rate Limit)  |     | Service          |
+-------------+     +---------------+     +------------------+
                                                   |
                    +------------------------------+
                    |                              |
                    v                              v
           +----------------+              +----------------+
           | Feature Store  |              | Model Registry |
           | (Online/Offline)|             | (Versions)     |
           +----------------+              +----------------+
                    ^                              ^
                    |                              |
           +----------------+              +----------------+
           | Feature        |              | Model Training |
           | Engineering    |              | Pipeline       |
           +----------------+              +----------------+
                    ^                              ^
                    |                              |
           +------------------------------------------+
           |           Data Lake / Warehouse          |
           +------------------------------------------+
```

### ML-Specific Components

| Component | Purpose | Technologies |
|-----------|---------|--------------|
| **Data Pipeline** | Ingest, clean, transform data | Airflow, Spark, Kafka |
| **Feature Store** | Compute, store, serve features | Feast, Tecton, Hopsworks |
| **Model Training** | Train and validate models | TensorFlow, PyTorch, XGBoost |
| **Model Registry** | Version and manage models | MLflow, Kubeflow |
| **Prediction Service** | Serve real-time predictions | TensorFlow Serving, Triton |
| **Experiment Tracking** | Track experiments and results | MLflow, Weights & Biases |
| **Monitoring** | Track model performance | Prometheus, custom dashboards |

### Two-Stage Recommendation Architecture

For recommendation/ranking problems, often use:

| Stage | Purpose | Model Complexity | Latency |
|-------|---------|-----------------|---------|
| **Retrieval (Candidate Generation)** | Narrow down to ~1000 candidates | Simple (embeddings, two-tower) | Low |
| **Ranking** | Score and order candidates | Complex (deep neural nets) | Higher |
| **Re-ranking** | Apply business rules, diversity | Rules + light ML | Low |

**Checkpoint:** *"Does this architecture handle our scale requirements? Ready to discuss data?"*

---

## Step 4: Data Collection & Preparation

**Goal:** Identify data sources, labeling strategies, and data quality considerations.

### Data Sources

| Type | Examples | Considerations |
|------|----------|----------------|
| **User Interactions** | Clicks, views, purchases, dwell time | Implicit signals, sparse |
| **User Profiles** | Demographics, preferences, history | Privacy, staleness |
| **Content Metadata** | Titles, descriptions, categories | May need enrichment |
| **External Data** | Knowledge graphs, third-party data | Integration complexity |
| **Real-time Signals** | Current session, device, location | Low latency requirements |

### Labeling Strategies

| Strategy | Pros | Cons | Best For |
|----------|------|------|----------|
| **Explicit Labels** | High quality | Expensive, sparse | Critical decisions |
| **Implicit Labels** | Abundant, automatic | Noisy, biased | Engagement prediction |
| **User Reports** | Direct feedback | Very sparse | Content moderation |
| **Human Annotation** | High quality | Slow, expensive | Training data bootstrap |
| **Semi-supervised** | Uses unlabeled data | Requires careful design | Limited labels |

### Data Quality Considerations

| Issue | Detection | Mitigation |
|-------|-----------|------------|
| **Selection Bias** | Analyze traffic sources | Importance weighting |
| **Position Bias** | Items at top get more clicks | Position-aware training |
| **Missing Data** | Check null rates | Imputation, separate features |
| **Label Noise** | Disagreement analysis | Noise-robust training |
| **Class Imbalance** | Check label distribution | Sampling, class weights |

### Train/Validation/Test Splits

| Split Type | When to Use | Implementation |
|------------|-------------|----------------|
| **Random Split** | IID assumption holds | Simple random sampling |
| **Time-based Split** | Temporal dependencies | Train on past, test on future |
| **User-based Split** | User-level predictions | Keep users in one split |
| **Stratified Split** | Imbalanced classes | Preserve class distribution |

**Checkpoint:** *"Is our data strategy robust? Ready for feature engineering?"*

---

## Step 5: Feature Engineering

**Goal:** Define features that capture relevant signals for the prediction task.

### Feature Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **User Features** | Properties of the user | Demographics, preferences, history |
| **Item Features** | Properties of the item | Metadata, embeddings, freshness |
| **Context Features** | Situational factors | Time, device, location, session |
| **Cross Features** | Interactions between entities | User-item affinity, co-occurrence |

### Feature Engineering Techniques

| Technique | Purpose | Example |
|-----------|---------|---------|
| **Aggregations** | Summarize behavior | Clicks in last 7 days |
| **Embeddings** | Dense representations | Word2Vec, item embeddings |
| **Bucketization** | Handle continuous features | Age buckets, time of day |
| **Crossing** | Capture interactions | User_country X Item_category |
| **Time Decay** | Weight recent actions | Exponential decay on clicks |

### Feature Computation

| Type | When to Use | Technologies |
|------|-------------|--------------|
| **Batch Features** | Daily/hourly updates sufficient | Spark, Hive |
| **Near-real-time** | Minutes-level freshness | Kafka, Flink |
| **Real-time** | Per-request computation | Feature store, in-memory |

### Feature Store Design

```
                    +------------------+
                    | Offline Store    |
                    | (Historical)     |
                    +--------+---------+
                             |
        +--------------------+--------------------+
        |                                         |
        v                                         v
+----------------+                       +----------------+
| Batch Pipeline |                       | Streaming      |
| (Spark)        |                       | Pipeline (Flink)|
+----------------+                       +----------------+
        |                                         |
        +--------------------+--------------------+
                             |
                             v
                    +------------------+
                    | Online Store     |
                    | (Low Latency)    |
                    +------------------+
                             |
                             v
                    +------------------+
                    | Prediction       |
                    | Service          |
                    +------------------+
```

**Checkpoint:** *"Are our features comprehensive? Ready for model development?"*

---

## Step 6: Model Development

**Goal:** Select and develop appropriate models for the task.

### Model Selection

Start simple and add complexity as needed:

| Level | Models | When to Use |
|-------|--------|-------------|
| **Baseline** | Heuristics, popularity, random | Always start here |
| **Simple ML** | Logistic Regression, Decision Trees | Few features, interpretability needed |
| **Tree Ensembles** | XGBoost, LightGBM, CatBoost | Tabular data, feature interactions |
| **Deep Learning** | DNNs, Transformers, Two-Tower | Large data, complex patterns |
| **Ensemble** | Multiple models combined | When marginal gains matter |

### Common Architectures by Problem Type

| Problem | Architecture | Key Ideas |
|---------|--------------|-----------|
| **Recommendations** | Two-Tower (Retrieval) + DNN (Ranking) | Separate query/item encoders |
| **Content Moderation** | Multi-task CNN/Transformer | Shared backbone, task-specific heads |
| **Search** | BERT for relevance + LTR | Semantic + behavioral signals |
| **Ad CTR** | Wide & Deep, DeepFM | Memorization + generalization |
| **Similar Items** | Siamese networks, contrastive learning | Learn embeddings |

### Offline Evaluation

| Evaluation Type | Purpose | Approach |
|-----------------|---------|----------|
| **Holdout Test** | Unbiased estimate | Fixed test set, never retrain on it |
| **Cross-validation** | Robust estimate | K-fold, time-series CV |
| **Ablation Studies** | Feature importance | Remove features, measure impact |
| **Error Analysis** | Understand failures | Slice by user/item attributes |

### Hyperparameter Tuning

| Method | Pros | Cons |
|--------|------|------|
| **Grid Search** | Exhaustive | Expensive |
| **Random Search** | More efficient | May miss optimal |
| **Bayesian Optimization** | Sample-efficient | Complex to implement |
| **Automated ML** | Hands-off | Less control |

**Checkpoint:** *"Is our model performing well offline? Ready to design the prediction service?"*

---

## Step 7: Prediction Service

**Goal:** Design how predictions are served to users.

### Batch vs Online Prediction

| Aspect | Batch | Online |
|--------|-------|--------|
| **Latency** | Hours/minutes | Milliseconds |
| **Freshness** | Stale | Real-time |
| **Complexity** | Lower | Higher |
| **Use Cases** | Email recommendations | Search results |
| **Infrastructure** | Cheaper | More expensive |

### Online Serving Architecture

```
Request --> Load Balancer --> Prediction Pods --> Response
                 |                    |
                 v                    v
           Cache Layer          Feature Lookup
                                      |
                                      v
                               Model Inference
                                      |
                                      v
                               Post-processing
```

### Latency Optimization

| Technique | Impact | Trade-off |
|-----------|--------|-----------|
| **Caching** | Major reduction | Freshness |
| **Model Quantization** | 2-4x speedup | Slight accuracy loss |
| **Model Distillation** | Smaller model | Training complexity |
| **Batching** | Better throughput | Latency variance |
| **GPU Serving** | Faster inference | Cost |

### Latency Requirements

| Service Type | P50 Target | P99 Target |
|--------------|------------|------------|
| **Search** | <50ms | <200ms |
| **Recommendations** | <100ms | <500ms |
| **Ads** | <10ms | <50ms |
| **Feed** | <100ms | <500ms |

**Checkpoint:** *"Is our serving infrastructure robust? Ready for online testing?"*

---

## Step 8: Online Testing & Deployment

**Goal:** Safely deploy and validate the model in production.

### Deployment Strategies

| Strategy | Risk Level | Use Case |
|----------|------------|----------|
| **Shadow Deployment** | None | New models, compare predictions |
| **Canary Release** | Low | Gradual rollout (1% -> 5% -> 25% -> 100%) |
| **Blue/Green** | Medium | Quick rollback capability |
| **A/B Test** | Controlled | Measure business impact |

### A/B Testing

| Aspect | Best Practice |
|--------|---------------|
| **Randomization** | User-level, not request-level |
| **Sample Size** | Power analysis for required N |
| **Duration** | Account for day-of-week effects |
| **Metrics** | Primary + guardrail metrics |
| **Significance** | p-value or Bayesian credible intervals |

### Common Pitfalls

| Pitfall | Description | Mitigation |
|---------|-------------|------------|
| **Network Effects** | Users influence each other | Cluster randomization |
| **Novelty Effect** | Users explore new features | Run longer experiments |
| **Selection Bias** | Different user populations | Check covariate balance |
| **Multiple Testing** | Many metrics, false positives | Bonferroni correction |

### Rollback Strategy

1. **Automated triggers** - Latency spikes, error rates, metric drops
2. **Quick rollback** - One-click or automatic
3. **Gradual rollout** - Pause at any percentage
4. **Feature flags** - Disable without redeploy

**Checkpoint:** *"Is our deployment strategy safe? Ready to discuss monitoring and scaling?"*

---

## Step 9: Scaling, Monitoring, Updates

**Goal:** Maintain model performance over time and handle scale.

### Scaling Strategies

| Component | Scaling Approach |
|-----------|------------------|
| **Training** | Distributed training (data/model parallelism) |
| **Feature Store** | Horizontal scaling, caching |
| **Serving** | Auto-scaling, load balancing |
| **Data Pipeline** | Partitioning, incremental processing |

### Model Monitoring

| What to Monitor | Why | How |
|-----------------|-----|-----|
| **Prediction Distribution** | Detect drift | Compare to baseline |
| **Feature Distribution** | Data quality | Statistical tests |
| **Latency** | User experience | P50, P95, P99 |
| **Error Rates** | System health | Threshold alerts |
| **Business Metrics** | Model effectiveness | Dashboard tracking |

### Drift Detection

| Type | Description | Detection |
|------|-------------|-----------|
| **Data Drift** | Input distribution changes | KL divergence, PSI |
| **Concept Drift** | Input-output relationship changes | Monitor prediction accuracy |
| **Label Drift** | Target distribution changes | Track label distributions |

### Retraining Strategies

| Strategy | When to Use | Trade-off |
|----------|-------------|-----------|
| **Scheduled** | Stable environment | May miss sudden shifts |
| **Triggered** | Drift detected | Requires robust monitoring |
| **Continuous** | Rapidly changing data | Infrastructure complexity |
| **Online Learning** | Real-time adaptation | Model stability concerns |

### Data Pipeline Monitoring

| Aspect | Monitor |
|--------|---------|
| **Freshness** | Data arrival time |
| **Completeness** | Missing values, dropped records |
| **Volume** | Record counts, size |
| **Schema** | Type changes, new fields |

---

## Interview Tips

### Time Allocation (45-60 min interview)

| Phase | Time | Focus |
|-------|------|-------|
| **Problem Formulation** | 5 min | Clarify, define ML task |
| **Metrics** | 5 min | Offline + online metrics |
| **Architecture** | 10 min | High-level components |
| **Data & Features** | 10 min | Sources, labeling, features |
| **Model** | 10 min | Selection, training, evaluation |
| **Serving & Deployment** | 10 min | Latency, testing, rollout |
| **Monitoring** | 5 min | Drift, retraining |

### What Interviewers Look For

| Quality | How to Demonstrate |
|---------|-------------------|
| **Structured Thinking** | Use the 9-step framework |
| **Trade-off Awareness** | "Option A is faster but less accurate..." |
| **Practical Experience** | Reference real-world challenges |
| **Scalability Mindset** | Consider 10x, 100x scale |
| **Communication** | Check in, ask if deep-diving is appropriate |

### Common Mistakes to Avoid

| Mistake | Better Approach |
|---------|-----------------|
| Jumping to models | Start with problem formulation |
| Ignoring offline metrics | Define how you'll evaluate offline |
| Complex models first | Start with baselines |
| Ignoring data quality | Discuss labeling, bias, drift |
| No monitoring plan | Always include monitoring |

---

## Example Walkthrough: Video Recommendation System

### Step 1: Problem Formulation
- **Business Goal:** Increase watch time and user retention
- **ML Task:** Two-stage ranking (retrieval + ranking)
- **Target:** P(user watches > 30 seconds | shown video)

### Step 2: Metrics
- **Offline:** NDCG@10, Watch Time Regression MAE
- **Online:** CTR, Average Watch Time, DAU, Session Length

### Step 3: Architecture
- Retrieval: Two-tower model (user + video embeddings)
- Ranking: Deep neural network with user, video, context features
- Re-ranking: Diversity, freshness, business rules

### Step 4: Data
- User watch history, likes, shares
- Video metadata, transcripts, visual features
- Implicit labels (watch > 30s = positive)

### Step 5: Features
- User: embedding, watch history, preferences
- Video: embedding, category, freshness, popularity
- Context: time of day, device, session length

### Step 6: Model
- Retrieval: Two-tower with approximate nearest neighbors
- Ranking: Wide & Deep with attention

### Step 7: Serving
- Retrieval: Batch (hourly) with ANN index
- Ranking: Real-time with 100ms latency target

### Step 8: Testing
- A/B test on 5% of users
- Primary: Watch time
- Guardrails: CTR not decreasing, latency < 200ms

### Step 9: Monitoring
- Daily drift detection on features
- Weekly retraining on new data
- Real-time alerts on latency and error rates
