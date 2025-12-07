# Learning Coach Plugin

Your personal learning coach for mastering complex topics through structured, step-by-step guidance.

## What's Included

- **2 Slash Commands**: `/learn` and `/lld`

## Features

### /learn Command
A comprehensive learning coaching system that helps you understand any topic by:

- **Breaking down complexity** - Transforms complex topics into manageable, digestible pieces
- **Structured guidance** - Provides overview, sub-topics, and logical learning paths
- **Rich explanations** - Uses examples, analogies, and real-world applications
- **Interactive learning** - Encourages questions and deeper exploration
- **Comprehensive summaries** - Recaps at each step and provides final comprehensive summary

### /lld Command
An interactive Low Level Design learning system designed for interview preparation that guides you through:

- **Problem clarification** - Understand requirements through Socratic questioning
- **Entity identification** - Discover core domain objects and data structures
- **Class design** - Define classes, relationships, and hierarchies with visual diagrams
- **Implementation** - Build clean, maintainable code with design patterns
- **Testing & validation** - Run test cases and verify the design
- **Interview prep** - Learn design patterns, complexity analysis, and extension strategies

**Includes 20 common LLD problems:**
- LRU Cache, Parking Lot, Elevator System, Library Management
- Tic-Tac-Toe, Chess Game, Hotel Booking, Movie Ticket Booking
- Vending Machine, ATM, Snake and Ladder, Car Rental
- Splitwise, Rate Limiter, Logger, Notification Service
- File System, Task Scheduler, Pub-Sub System, Connection Pool

## How to Use

### General Learning with /learn
```bash
/learn [topic]
```

The coach will:
1. Introduce itself as your Learning Coach
2. Ask what topic you'd like to learn about (if not specified)
3. Provide an overview of the learning path
4. Guide you step-by-step through the topic

**Examples:**
```bash
/learn machine learning
/learn database design
/learn React best practices
```

### Low Level Design with /lld
```bash
/lld [problem-name or "list"]
```

The LLD coach will:
1. Present the problem or show available problems (if "list" specified)
2. Guide you through requirements clarification
3. Help identify core entities and relationships
4. Assist with class design and implementation
5. Walk through testing and validation
6. Provide interview preparation insights

**Examples:**
```bash
/lld list                    # Show all 20 common problems
/lld LRU Cache              # Start with LRU Cache problem
/lld Parking Lot            # Start with Parking Lot problem
/lld Elevator System        # Start with Elevator System problem
```

### Learning Topics (/learn)
The coach can help you understand:
- **Technical Topics**: Programming languages, AI/ML, Databases, Cloud Computing, DevOps
- **Science**: Physics, Chemistry, Biology, Astronomy, Mathematics
- **Business & Economics**: Marketing, Finance, Strategy, Entrepreneurship, Sales
- **Soft Skills**: Communication, Leadership, Problem-Solving, Negotiation, Public Speaking
- **Creative Subjects**: Writing, Design, Music, Art, Photography
- **And any topic you want to master!**

### LLD Problem Categories (/lld)
- **Data Structures**: LRU Cache, Connection Pool
- **Systems**: Parking Lot, Elevator System, Vending Machine, ATM, File System
- **Management**: Library Management, Hotel Booking, Car Rental
- **Entertainment**: Tic-Tac-Toe, Chess, Snake and Ladder, Movie Ticket Booking
- **Applications**: Splitwise, Rate Limiter, Logger, Notification Service, Pub-Sub System, Task Scheduler

## Learning Approach

### /learn - General Learning Coach

**Role:** A patient, knowledgeable, and enthusiastic guide who adapts to your level of understanding.

**Process:**
1. **Initial Inquiry** - Understand what you want to learn
2. **Overview First** - Outline the bigger picture and key concepts
3. **Step-by-Step Breakdown** - Guide through each concept logically
4. **Practical Application** - Provide examples and real-world applications
5. **Reinforcement** - Summarize at each step and provide comprehensive final summary

### /lld - Low Level Design Coach

**Role:** An expert system design interviewer who helps you practice LLD interview problems through interactive guidance.

**Process:**
1. **Requirements Clarification** - Ask clarifying questions like a real interviewer
2. **Entity Identification** - Guide discovery of core domain objects and data structures
3. **Class Design** - Help design classes with proper relationships and hierarchies
4. **Implementation** - Walk through clean code implementation with design patterns
5. **Testing** - Validate the design with comprehensive test cases
6. **Analysis** - Discuss complexity, patterns used, and possible extensions

**Interview Style:**
- Socratic approach - asks questions rather than giving answers directly
- Provides hints when you're stuck
- Validates understanding at checkpoints
- Encourages creative problem-solving

### Communication Style (Both Commands)
- Clear and straightforward language
- Patient and encouraging tone
- Matches your communication style
- Welcomes questions and discussion
- Adapts to your learning pace

## Example Sessions

### /learn Example
```
/learn machine learning

Coach: Hello! I'm your personal Learning Coach. I'm excited to help you understand machine learning!

Let me give you an overview of what we'll cover:

1. **Foundations** - What is machine learning and how it differs from traditional programming
2. **Core Concepts** - Supervised vs unsupervised learning, training data
3. **Key Algorithms** - Linear regression, classification, clustering
4. **Real-World Applications** - How companies use ML today
5. **Getting Started** - Practical next steps for learning more

Let's begin with the foundations...
```

### /lld Example
```
/lld LRU Cache

Interviewer: Let's design an LRU Cache. What clarifying questions would you ask?

[You ask questions about capacity, eviction policy, thread safety, etc.]

Interviewer: Good questions! Based on our discussion, let's identify the core entities.
What main components would you need in an LRU Cache?

[You identify entities: Node, Cache, DoubleLinkedList]

Interviewer: Great thinking! Now let's design the classes. What attributes and methods
would each class need? Let me review your design...

[Continues through design, implementation, testing, and analysis phases]
```

## Installation

This plugin is ready to use once installed in your Claude workspace.

### Quick Start
1. Install the plugin
2. Run `/learn`
3. Tell the coach what you want to learn
4. Follow along as they break down the topic step-by-step

## Tips for Best Results

1. **Be specific** - The more specific your topic, the better the guidance
2. **Ask questions** - Don't hesitate to ask for clarification or deeper dives
3. **Take notes** - Write down key points and examples as you learn
4. **Practice** - Apply what you learn in real projects or exercises
5. **Review** - Go back through the summaries when you need reinforcement

## About the Coach

Your Learning Coach is designed with these characteristics:
- **Approachable & Friendly** - Like a mentor you can trust
- **Patient & Encouraging** - Celebrates your learning journey
- **Knowledgeable & Enthusiastic** - Genuinely enjoys helping people learn
- **Adaptive** - Adjusts explanations based on your understanding level

## License

MIT License - Feel free to use and modify as needed.
