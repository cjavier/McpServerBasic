# MCP Server Documentation

This directory contains documentation for the Model Context Protocol (MCP) server implementation.

## What is MCP?

The Model Context Protocol (MCP) is a standard that enables AI assistants to interact with external services and data sources. This server implementation allows AI assistants like Claude to access tools and data through a standardized interface.

## Server Architecture

The server is built using TypeScript and follows a task-based architecture:

- `src/index.ts`: The main entry point for the MCP server
- `src/runner.ts`: Task runner for managing and executing tasks
- `src/tasks/`: Directory containing all available tasks

## Creating New Tasks

Tasks are the building blocks of the MCP server. Each task implements a specific functionality that can be accessed by AI assistants.

To create a new task:

1. Create a new TypeScript file in the appropriate subdirectory of `src/tasks/`
2. Implement the task following the `ForgeTask` interface
3. Register the task in `src/runner.ts`

See the existing tasks for examples of how to implement and register tasks.

## Task Structure

A typical task implementation includes:

- Input schema: Defines the expected input parameters
- Output schema: Defines the structure of the returned data
- Run function: Implements the actual task logic

## Testing Tasks

You can test tasks directly using the Forge CLI:

