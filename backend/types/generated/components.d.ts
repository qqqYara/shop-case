import type { Schema, Struct } from '@strapi/strapi';

export interface ProductBadge extends Struct.ComponentSchema {
  collectionName: 'components_product_badges';
  info: {
    description: 'A badge shown on a product card';
    displayName: 'Badge';
    icon: 'priceTag';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductOption extends Struct.ComponentSchema {
  collectionName: 'components_product_options';
  info: {
    description: 'A selectable option on a product card';
    displayName: 'Option';
    icon: 'bulletList';
  };
  attributes: {
    discount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    image: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'product.badge': ProductBadge;
      'product.option': ProductOption;
    }
  }
}
