# Tasks API and Events

## API

### Get Tasks

`GET /tasks`

Returns a list of tasks.

### Get Task

`GET /tasks/{id}`

Returns a single task by ID.

## Events

### Task Created

`task.created`

Event triggered when a new task is created.

### Task Updated

`task.updated`

Event triggered when a task is updated.