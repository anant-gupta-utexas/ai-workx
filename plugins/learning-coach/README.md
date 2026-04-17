# Learning Coach Plugin

Your personal learning and system design coach for mastering complex topics, practicing SWE system design (LLD & HLD), and preparing for ML system design interviews.

## What's Included

- **2 Skills**:
  - `learning_methods` — Three science-backed learning modes: personalized learning plans, Feynman Technique, and Socratic tutoring
  - `technical_coach` — System design coaching with 3 integrated modes: general learning, SWE system design (20 LLD + 15 HLD problems), and ML system design (10 MLE interview problems with 9-step framework)

## Learning Methods Skill

Grounded in cognitive science research (Kahneman's System 1/System 2, Vygotsky's Zone of Proximal Development, *Make It Stick*), this skill provides three structured approaches to learning any topic.

### Learning Plan — Structured Assessment + Roadmap
A 3-phase diagnostic that maps your current understanding and generates a personalized study plan:
1. **Phase 1** — 10 foundational diagnostic questions
2. **Phase 2** — 10 applied/practical questions
3. **Phase 3** — Personalized roadmap with 5–7 targeted tasks

**Best for:** Starting a new topic with a clear, structured path forward.

### Feynman Technique — Deep Understanding Through Analogy
Iterative simplification inspired by Richard Feynman's teaching philosophy:
1. Simple explanation with a concrete analogy
2. Identify common misconceptions, ask probing questions
3. 2–3 refinement cycles (each clearer than the last)
4. Teach-back challenge — you explain it in your own words
5. Teaching snapshot — compressed, memorable summary

**Best for:** Building intuition for unfamiliar or complex topics.

### Socratic Method — Guided Discovery Through Questions
No direct answers — only carefully sequenced questions that lead you to discover the answers yourself:
1. Foundational probing to map your baseline
2. Misconception discovery through contradicting questions
3. Deep understanding via increasingly challenging questions
4. Synthesis — you summarize what you discovered

**Best for:** Strengthening and pressure-testing existing knowledge.

## Technical Coach Skill

### Three Integrated Modes

#### 1. General Learning Mode
Helps you understand any complex topic through step-by-step guidance with examples, analogies, and real-world applications.

#### 2. SWE System Design Mode (LLD & HLD)
Interactive system design coaching for software engineering interview preparation.

**Low Level Design (LLD) — "The How"**
- Problem clarification through Socratic questioning
- Entity identification and data structure design
- Class design with proper relationships and hierarchies
- Clean code implementation with design patterns
- Testing and validation

**High Level Design (HLD) — "The What"**
- Requirements gathering for scale and constraints
- Architecture design with major components
- Communication patterns (REST, gRPC, async messaging)
- Technology stack selection
- Scalability, reliability, and monitoring strategies

#### 3. ML System Design Mode (MLE Interviews)
A specialized coach using the **9-step framework**:

1. **Problem Formulation** — Translate business problems to ML tasks
2. **Metrics Definition** — Offline (precision, recall, NDCG) + online metrics
3. **Architectural Components** — ML pipeline + infrastructure design
4. **Data Collection & Preparation** — Labeling, sources, augmentation
5. **Feature Engineering** — User, item, context, cross-features
6. **Model Development** — Model selection, baselines, offline evaluation
7. **Prediction Service** — Batch vs online, latency requirements
8. **Online Testing & Deployment** — A/B tests, canary releases
9. **Scaling, Monitoring, Updates** — Drift detection, retraining

## Problem Libraries

### LLD Problems (20)
| Category | Problems |
|----------|----------|
| **Data Structures** | LRU Cache, Connection Pool |
| **Systems** | Parking Lot, Elevator System, Vending Machine, ATM, File System |
| **Management** | Library Management, Hotel Booking, Car Rental |
| **Entertainment** | Tic-Tac-Toe, Chess, Snake and Ladder, Movie Ticket Booking |
| **Applications** | Splitwise, Rate Limiter, Logger, Notification Service, Pub-Sub, Task Scheduler |

### HLD Problems (15)
| Category | Problems |
|----------|----------|
| **Streaming** | Netflix, YouTube, TikTok, Spotify |
| **Social** | Instagram, Twitter/X, Discord |
| **Ride-Sharing & Delivery** | Uber, DoorDash |
| **Marketplace** | Amazon, Airbnb |
| **Productivity** | Slack, Zoom |
| **Storage & Maps** | Dropbox, Google Maps |

### ML System Design Problems (10)
| Category | Problems |
|----------|----------|
| **Search & Ranking** | Visual Search System, YouTube Video Search, Similar Listings |
| **Recommendations** | Video Recommendation, Event Recommendation, Personalized News Feed |
| **Content Moderation** | Harmful Content Detection, Google Street View Blurring |
| **Ads** | Ad Click Prediction |
| **Social** | People You May Know |

## How to Use

Both skills auto-activate based on your request. Examples:

### Learning Methods (Auto-Activate)
```
"Help me learn CSS Flexbox — I'm a beginner"          # Learning Plan
"Create a learning plan for distributed systems"       # Learning Plan
"Explain database indexing using the Feynman method"   # Feynman Technique
"Teach me recursion like I'm five"                     # Feynman Technique
"I want to test my understanding of React Hooks"       # Socratic Method
"Quiz me on distributed consensus"                     # Socratic Method
```

### Technical Coach (Auto-Activate)
```
"Help me understand distributed systems"               # General Learning
"Practice LRU Cache LLD problem"                       # SWE LLD
"Design Netflix architecture"                          # SWE HLD
"Design a video recommendation system"                 # ML System Design
"Practice harmful content detection for MLE interview" # ML System Design
```

## File Structure

```
skills/
  learning_methods/
    SKILL.md              # Learning science foundation + mode selection
    resources/
      learning-plan.md    # 3-phase diagnostic assessment workflow
      feynman.md          # Feynman Technique workflow
      socratic.md         # Socratic method workflow
  technical_coach/
    SKILL.md              # Main skill with mode detection and overview
    resources/
      hld.md              # Detailed HLD guide (6-section flow)
      lld.md              # Detailed LLD guide (5-section flow)
      mle.md              # ML System Design (9-step framework)
```

## Tips for Best Results

1. **Be specific** — The more specific your topic or problem, the better the guidance
2. **Embrace the struggle** — Frustration means System 2 is engaged and real learning is happening
3. **Practice actively** — Try to answer before the coach reveals solutions
4. **Teach it back** — Explaining to others deepens your own understanding
5. **Space it out** — Return to topics after breaks for stronger retention

## License

MIT License - Feel free to use and modify as needed.
