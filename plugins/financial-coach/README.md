# Financial Coach Plugin

Your personal financial coach for mastering money management, investing, and financial planning through structured, step-by-step guidance.

## What's Included

- **2 Skills**: company-valuation, yt-financial-summary
- **0 Commands**: Ready to add custom financial coaching commands

## Skills

### company-valuation

Comprehensive investment analysis that surfaces key decision points for evaluating whether a company is a good investment. Uses a multi-phase framework combining moat analysis, sector-appropriate valuation metrics, and reverse DCF reality checks.

**Triggers:**
- Providing a company name or ticker for analysis
- Asking "Should I invest in [company]?"
- Requesting stock valuation or investment analysis
- Wanting help evaluating an investment opportunity

**What it does:**
1. Gathers current market data via web search
2. Analyzes business fundamentals (what it does, how it makes money)
3. Assesses competitive moats and market sentiment tier
4. Applies sector-appropriate valuation metrics
5. Runs a reverse DCF reality check
6. Evaluates risks and provides investment verdict

**Output includes:**
- Business model breakdown with revenue streams
- Moat assessment (switching costs, network effects, cost advantage, intangibles)
- Market sentiment classification (Trash Bin to Cult Status)
- Sector-specific valuation metrics with benchmarks
- Financial health and capital efficiency analysis
- Reverse DCF implied growth expectations
- Risk assessment matrix
- Final investment recommendation with bull/bear cases

**Example usage:**
```
Should I invest in Apple?
Analyze NVDA as an investment
Is Microsoft a good buy right now?
```

### yt-financial-summary

Fetches YouTube video transcripts and generates comprehensive financial analysis summaries.

**Triggers:**
- Providing a YouTube URL for financial video analysis
- Asking to analyze a financial/investment video
- Requesting a summary of a YouTube finance video

**What it does:**
1. Extracts the video ID from YouTube URL
2. Fetches the transcript using `youtube-transcript-api`
3. Analyzes and summarizes into a structured format

**Output includes:**
- Key companies discussed (with tickers)
- Fundamental analysis (revenue, ratios, growth metrics)
- Technical analysis elements (price patterns, support/resistance)
- Investment thesis (bull/bear case, price targets)
- Credibility assessment (speaker background, data support, biases)
- Key timestamps for important insights

**Requirements:**
```bash
pip install youtube-transcript-api
```

**Example usage:**
```
Analyze this financial video: https://www.youtube.com/watch?v=VIDEO_ID
```

## Features

This plugin provides a foundation for financial coaching capabilities. Add commands to enable:

- **Personal Finance** - Budgeting, saving strategies, emergency funds, debt management
- **Investment Education** - Stocks, bonds, ETFs, mutual funds, asset allocation
- **Retirement Planning** - 401(k), IRA, compound interest, retirement calculators
- **Tax Strategies** - Tax-advantaged accounts, deductions, capital gains
- **Wealth Building** - Long-term wealth strategies, passive income, real estate basics

## Getting Started

### Using the YouTube Financial Summary Skill

1. Install the required dependency:
   ```bash
   pip install youtube-transcript-api
   ```

2. Provide a YouTube URL:
   ```
   Summarize this financial video: https://www.youtube.com/watch?v=xyz123
   ```

3. The skill will fetch the transcript and provide a comprehensive analysis

### Adding Custom Commands

Add commands to the `commands/` directory to create financial coaching workflows.

**Example Command Ideas:**
- `/budget` - Interactive budgeting session
- `/invest` - Investment strategy coaching
- `/retire` - Retirement planning guidance
- `/debt` - Debt payoff strategies

## Installation

This plugin is ready to use once installed in your Claude workspace.

```bash
/plugin install financial-coach@claude-workspace-plugins
```

## License

MIT License - Feel free to use and modify as needed.
