# Low Level Design (LLD) Guide

## Overview

Low Level Design focuses on the **"How"** - the implementation details of a single component or service. It's about designing classes, understanding data structures, implementing algorithms, and writing clean code.

### Key Characteristics
- **Focus**: Implementation details, class design, algorithms, data structures
- **Scope**: Single service/component design
- **Output**: Classes, relationships, code implementation
- **Audience**: Software engineers, developers

---

## Common LLD Problems

| # | Problem | Description |
|---|---------|-------------|
| 1 | **LRU Cache** | Design a Least Recently Used cache |
| 2 | **Parking Lot** | Design a parking lot system |
| 3 | **Elevator System** | Design an elevator management system |
| 4 | **Library Management** | Design a library management system |
| 5 | **Tic-Tac-Toe** | Design a Tic-Tac-Toe game |
| 6 | **Chess Game** | Design a chess game |
| 7 | **Hotel Booking** | Design a hotel booking system |
| 8 | **Movie Ticket Booking** | Design a movie ticket booking system (BookMyShow) |
| 9 | **Vending Machine** | Design a vending machine |
| 10 | **ATM Machine** | Design an ATM system |
| 11 | **Snake and Ladder** | Design Snake and Ladder game |
| 12 | **Car Rental** | Design a car rental system |
| 13 | **Splitwise** | Design expense sharing system |
| 14 | **Rate Limiter** | Design a rate limiting system |
| 15 | **Logger** | Design a logging framework |
| 16 | **Notification Service** | Design a notification system |
| 17 | **File System** | Design an in-memory file system |
| 18 | **Task Scheduler** | Design a task scheduling system |
| 19 | **Pub-Sub System** | Design a publish-subscribe messaging system |
| 20 | **Connection Pool** | Design a database connection pool |

---

## LLD Interview Flow

Guide the user through these sections **interactively**. Do NOT reveal all sections at once. Progress step-by-step, asking for user input and validating their understanding before moving forward.

---

## Section 1: Clarifying Requirements

**Your Role:** Act as an interviewer. Present the problem statement briefly, then wait for the user to ask clarifying questions.

**Instructions:**
1. Give a brief, 2-3 sentence overview of the problem
2. Ask the user: *"What clarifying questions would you ask before starting the design?"*
3. Wait for user input
4. Respond to their questions as an interviewer would (sometimes saying "good question", sometimes pushing back, sometimes giving hints)
5. After sufficient discussion, summarize the requirements together

### 1.1 Functional Requirements

Help the user identify and list the core functional requirements:
- What operations must the system support?
- What are the inputs and outputs?
- What are the edge cases?

### 1.2 Non-Functional Requirements

Guide discussion on:

| Requirement | Questions to Ask |
|-------------|-----------------|
| **Time Complexity** | What are the expected time complexities for main operations? |
| **Space Complexity** | Are there memory constraints? |
| **Thread Safety** | Does it need to be thread-safe? |
| **Scalability** | Does it need to scale? |
| **Extensibility** | What future extensions might be needed? |

**Checkpoint:** Before moving to Section 2, confirm: *"Are we aligned on the requirements? Ready to identify core entities?"*

---

## Section 2: Identifying Core Entities

**Your Role:** Guide the user to discover entities themselves rather than giving answers directly.

**Instructions:**
1. Ask: *"Based on our requirements, what are the main entities/objects we'll need in our system?"*
2. Let the user brainstorm
3. Provide hints if they're stuck (e.g., "Think about what data structures would give us O(1) lookup...")
4. Discuss why certain entities are needed
5. Help them understand the relationships between entities

### Discussion Points

| Area | Questions |
|------|-----------|
| **Core Domain Objects** | What are the main "nouns" in the problem? |
| **Data Structures** | What structures are needed for performance requirements? |
| **Utility Classes** | What helper classes might be useful? |
| **Interactions** | How do these entities interact with each other? |

**Checkpoint:** *"Great, we've identified our entities. Shall we design the classes and their relationships?"*

---

## Section 3: Designing Classes and Relationships

### 3.1 Class Definitions

**Your Role:** Help the user define each class methodically.

For each class, guide them through:

| Aspect | Questions |
|--------|-----------|
| **Attributes** | What data does this class hold? |
| **Methods** | What operations does this class support? |
| **Responsibility** | What is this class's single responsibility? |

Ask the user to describe each class, then provide feedback and suggestions.

### 3.2 Class Relationships

Guide discussion on:

| Relationship | Description | When to Use |
|--------------|-------------|-------------|
| **Composition ("has-a")** | Strong ownership, lifecycle tied | Inner objects don't exist without outer |
| **Association ("uses-a")** | Uses another class | References another class for functionality |
| **Inheritance ("is-a")** | Hierarchy or interface | Shared behavior, polymorphism |
| **Aggregation** | Weak ownership, shared lifecycle | Objects can exist independently |

Ask: *"How should these classes relate to each other? Which contains which?"*

### 3.3 Full Class Diagram

Help the user visualize the design using Mermaid:

```mermaid
classDiagram
    class ClassName {
        -privateAttribute: Type
        +publicAttribute: Type
        +method(): ReturnType
        -privateMethod(): ReturnType
    }
    ClassA --> ClassB : composition
    ClassA ..> ClassC : uses
    ClassD --|> ClassE : inherits
```

Review the diagram together for completeness and discuss any missing pieces.

**Checkpoint:** *"The design looks solid. Ready to implement?"*

---

## Section 4: Implementation

**Your Role:** Guide the user through implementing the design in Python (or their preferred language).

**Instructions:**
1. Ask: *"Which class should we implement first?"* (guide toward building blocks first)
2. For each class:
   - Let the user attempt first if they want
   - Review their code or provide implementation with detailed comments
   - Explain design decisions and trade-offs
3. Focus on:
   - Clean, readable code
   - Proper encapsulation
   - Thread safety (if required)
   - Edge case handling
   - Following SOLID principles

### Implementation Order

Suggest this flow for most problems:

| Order | What to Implement | Why |
|-------|-------------------|-----|
| 1 | **Utility/Helper Classes** | Enums, constants, simple data classes |
| 2 | **Core Data Structures** | Nodes, base structures |
| 3 | **Domain Classes** | Business logic classes |
| 4 | **Orchestrating Class** | Main class that ties everything together |
| 5 | **Thread Safety** | Add locks, synchronization if needed |

### Code Quality Focus

| Principle | Implementation |
|-----------|----------------|
| **Single Responsibility** | Each class does one thing well |
| **Open/Closed** | Open for extension, closed for modification |
| **Liskov Substitution** | Subtypes can replace base types |
| **Interface Segregation** | Small, specific interfaces |
| **Dependency Inversion** | Depend on abstractions, not concretions |

After each class, ask: *"Does this implementation make sense? Any questions before we continue?"*

**Checkpoint:** *"Implementation complete! Let's test it."*

---

## Section 5: Run and Test

**Your Role:** Help the user verify their implementation works correctly.

**Instructions:**
1. Create a demo/driver class showing usage
2. Walk through test cases together:
   - Basic functionality tests
   - Edge case tests
   - Boundary condition tests
3. If thread safety was required, discuss how to test concurrent behavior
4. Trace through the code execution for key operations

### Test Categories

| Category | What to Test |
|----------|--------------|
| **Happy Path** | Normal expected usage |
| **Edge Cases** | Empty inputs, single elements, capacity limits |
| **Error Handling** | Invalid inputs, exceptional conditions |
| **Boundary Conditions** | Max/min values, overflow scenarios |
| **Performance** | Verify time complexity claims |

### Example Test Structure

```python
def main():
    # Test Case 1: Basic functionality
    print("Test 1: Basic functionality")
    # ... test code ...

    # Test Case 2: Edge cases
    print("Test 2: Edge cases")
    # ... test code ...

    # Test Case 3: Boundary conditions
    print("Test 3: Boundary conditions")
    # ... test code ...

    print("All tests passed!")

if __name__ == "__main__":
    main()
```

---

## Session Wrap-up

After completing all sections, provide:

### 1. Summary of Key Design Decisions

- Why certain data structures were chosen
- Trade-offs made and alternatives considered
- Key insights about the problem

### 2. Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|-----------------|------------------|
| Main operation 1 | O(?) | O(?) |
| Main operation 2 | O(?) | O(?) |

### 3. Design Patterns Used

Identify any patterns applied:
- **Singleton** - Single instance
- **Strategy** - Interchangeable algorithms
- **Observer** - Event notification
- **Factory** - Object creation
- **State** - State machine behavior

### 4. Possible Extensions

How would this design handle new requirements?
- Adding new features
- Handling scale
- Supporting new use cases

### 5. Interview Tips

| What Interviewers Look For | How to Demonstrate |
|---------------------------|-------------------|
| **Problem-solving approach** | Ask clarifying questions first |
| **OOP knowledge** | Use appropriate design patterns |
| **Code quality** | Clean, readable, well-structured code |
| **Testing mindset** | Think about edge cases proactively |
| **Communication** | Explain your reasoning clearly |

Ask: *"Would you like to explore any extensions or try another problem?"*
