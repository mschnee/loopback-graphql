These JSON files represent a small set of relational data for the purpose of testing resolvers.

# Company/User/Auth
```gql
query getCompany(id: ID!) {
    name # Company entity
    owner { # User entity
        name
        email # Auth entity
    }
    employees { # User[] entity
        name
        email # Auth Entity
        manager { # User Entity
            name 
            email # Auth Entity
        }
    }
}
```

## Companies
A `Company`.  Each company has an owner.

## Users
A `User`.  A User can own 0-or-more companies.  A user can have zero-or-one managers.  This presents a management heirarchy.

## Auths
The `Auth` is the record of how a `User` logs in and contains their email address.

# Policy Templates / Company Policies / Documents
`PolicyTemplates` are global templates that can be implemented/customized per-company.
A `CompanyPolicy` is an instance of a `PolicyTemplate` created for a company.
A `Document` is a personalized instance of a `CompanyPolicy` generated for a user, with a time/dates representing when the document was sent to the user, and when it was signed.

```gql
query getCompany(id: ID!) {
    name # Company entity
    policies { # CompanyPolicy[] entity
        name
        original { # PolicyTemplate entity
            name 
        }
        sentTo { # User[] entity
            name
        }
        signedBy { # User[] entity representing users that HAVE signed the document
            name
        }
        notSignedBy { # User[] entity representing users that have NOT signed yet.
            name
            manager { # User entity
                name
            }
        }
    }
}
```

# Notes
The purpose behind this is to demonstrate cross-relational data relationships and to ensure that the resolver functions operate appropriately; but also to provide a robust-enough case for implementing a `dataloader`.  The second query should require, maximum, two passes of a `getUsersById()` dataloader, given the following query:

```gql
query getCompany(id: ID!) {
    name 
    policies { 
        name
        notSignedBy { # First pass of the dataloader to populate this array
            name
            manager { # Second pass of the dataloader to populate any users not yet loaded.
                name
            }
        }
    }
}
```