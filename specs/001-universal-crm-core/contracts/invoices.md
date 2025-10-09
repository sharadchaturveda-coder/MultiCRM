# Invoices API and Events

## API

### Get Invoices

`GET /invoices`

Returns a list of invoices.

### Get Invoice

`GET /invoices/{id}`

Returns a single invoice by ID.

## Events

### Invoice Created

`invoice.created`

Event triggered when a new invoice is created.

### Invoice Updated

`invoice.updated`

Event triggered when an invoice is updated.