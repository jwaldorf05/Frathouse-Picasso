export const IMAGE_FRAGMENT = `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

export const PRODUCT_VARIANT_FRAGMENT = `
  fragment ProductVariantFields on ProductVariant {
    id
    title
    availableForSale
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    selectedOptions {
      name
      value
    }
    image {
      ...ImageFields
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 20) {
      edges {
        node {
          ...ImageFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    variants(first: 100) {
      edges {
        node {
          ...ProductVariantFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    options {
      id
      name
      values
    }
    tags
    updatedAt
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

export const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              product {
                id
                handle
                title
              }
              price {
                amount
                currencyCode
              }
              image {
                ...ImageFields
              }
              selectedOptions {
                name
                value
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;
