# Learning Coach Plugin

Your personal learning and system design coach for mastering complex topics, practicing SWE system design (LLD & HLD), and preparing for ML system design interviews.

## What's Included

- **1 Skill**: `technical_coach` - A comprehensive skill covering:
  - General learning for any topic
  - SWE System Design (20 LLD + 15 HLD problems)
  - ML System Design (10 MLE interview problems with 9-step framework)

## Features

### Three Integrated Modes

#### 1. General Learning Mode
A comprehensive learning coaching system that helps you understand any topic by:
- **Breaking down complexity** - Transforms complex topics into manageable pieces
- **Structured guidance** - Provides overview, sub-topics, and logical learning paths
- **Rich explanations** - Uses examples, analogies, and real-world applications
- **Interactive learning** - Encourages questions and deeper exploration
- **Comprehensive summaries** - Recaps at each step with final summary

#### 2. SWE System Design Mode (LLD & HLD)
An interactive system design coach for software engineering interview preparation:

**Low Level Design (LLD) - "The How"**
- Problem clarification through Socratic questioning
- Entity identification and data structure design
- Class design with proper relationships and hierarchies
- Clean code implementation with design patterns
- Testing and validation with comprehensive test cases

**High Level Design (HLD) - "The What"**
- Requirements gathering for scale and constraints
- Architecture design with major components and services
- Communication patterns (REST, gRPC, async messaging)
- Technology stack selection
- Scalability, reliability, and monitoring strategies

#### 3. ML System Design Mode (MLE Interviews)
A specialized coach for ML system design interviews using the **9-step framework**:

1. **Problem Formulation** - Translate business problems to ML tasks
2. **Metrics Definition** - Offline (precision, recall, NDCG) + online metrics
3. **Architectural Components** - ML pipeline + infrastructure design
4. **Data Collection & Preparation** - Labeling, sources, augmentation
5. **Feature Engineering** - User, item, context, cross-features
6. **Model Development** - Model selection, baselines, offline evaluation
7. **Prediction Service** - Batch vs online, latency requirements
8. **Online Testing & Deployment** - A/B tests, canary releases
9. **Scaling, Monitoring, Updates** - Drift detection, retraining

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

The skill activates automatically based on your request. Examples:

### General Learning
```
"Help me understand distributed systems"
"Teach me about database indexing"
"I want to learn about machine learning"
```

### SWE System Design
```
"Practice LRU Cache LLD problem"
"Design a parking lot system"
"Help me design Netflix architecture"
"Practice HLD for Instagram"
```

### ML System Design
```
"Design a video recommendation system"
"How would you build a visual search system?"
"Practice harmful content detection for MLE interview"
"Help me design a personalized news feed"
```

## Learning Approach

### General Learning Coach
- **Approachable & Friendly** - Like a mentor you can trust
- **Patient & Encouraging** - Adapts to your pace
- **Step-by-Step** - Logical progression through concepts

### System Design Interview Style
- **Socratic approach** - Asks questions rather than giving answers directly
- **Checkpoints** - Validates understanding at each stage
- **Hints when stuck** - Guides without giving away answers
- **Real interview simulation** - Prepares you for actual interviews

## File Structure

```
skills/
  technical_coach/
    SKILL.md           # Main skill with mode detection and overview
    resources/
      hld.md           # Detailed HLD guide (6-section flow)
      lld.md           # Detailed LLD guide (5-section flow)
      mle.md           # ML System Design (9-step framework)
```

## Tips for Best Results

1. **Be specific** - The more specific your topic or problem, the better the guidance
2. **Ask questions** - Don't hesitate to ask for clarification or deeper dives
3. **Practice actively** - Try to answer before the coach reveals solutions
4. **Take notes** - Write down key points and design decisions
5. **Review** - Go back through the summaries when you need reinforcement

## License

MIT License - Feel free to use and modify as needed.
