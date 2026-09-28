import type { Core } from '@strapi/strapi';

type LayoutField = {
  name: string;
  size: number;
};

function placeFieldBefore(
  layout: LayoutField[][],
  fieldName: string,
  beforeName: string,
): LayoutField[][] {
  let field: LayoutField | undefined;

  const withoutField = layout
    .map((row) =>
      row.filter((item) => {
        if (item.name !== fieldName) {
          return true;
        }

        field = item;
        return false;
      }),
    )
    .filter((row) => row.length > 0);

  if (!field) {
    return layout;
  }

  const targetIndex = withoutField.findIndex((row) =>
    row.some((item) => item.name === beforeName),
  );

  if (targetIndex === -1) {
    return layout;
  }

  const next = [...withoutField];
  next.splice(targetIndex, 0, [field]);
  return next;
}

const PUBLIC_READ_ACTIONS = [
  'api::announcement.announcement.find',
  'api::announcement.announcement.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
  'api::product.product.find',
  'api::product.product.findOne',
] as const;

const DEFAULT_ANNOUNCEMENT = 'Get 15% off with code LUMEAFIRST15';

const DEFAULT_CATEGORIES = ['Cleansers', 'Face Wash', 'Makeup Removers'] as const;

async function allowPublicRead(strapi: Core.Strapi) {
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) {
    return;
  }

  await Promise.all(
    PUBLIC_READ_ACTIONS.map(async (action) => {
      const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
        where: { action, role: publicRole.id },
      });

      if (existing) {
        return;
      }

      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: publicRole.id },
      });
    }),
  );
}

async function seedAnnouncements(strapi: Core.Strapi) {
  const existing = await strapi.documents('api::announcement.announcement').findMany({
    status: 'published',
  });

  if (existing.length > 0) {
    return;
  }

  await strapi.documents('api::announcement.announcement').create({
    data: { message: DEFAULT_ANNOUNCEMENT, order: 0 },
    status: 'published',
  });
}

async function seedCategories(strapi: Core.Strapi) {
  const existing = await strapi.documents('api::category.category').findMany({
    status: 'published',
  });

  if (existing.length > 0) {
    return;
  }

  await Promise.all(
    DEFAULT_CATEGORIES.map((name, order) =>
      strapi.documents('api::category.category').create({
        data: { name, order },
        status: 'published',
      }),
    ),
  );
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const uid = 'api::product.product';
    const contentTypes = strapi.plugin('content-manager').service('content-types') as {
      findContentType: (uid: string) => { uid: string };
      findConfiguration: (contentType: { uid: string }) => Promise<{
        layouts: {
          list: string[];
          edit: LayoutField[][];
        };
      }>;
      updateConfiguration: (
        contentType: { uid: string },
        configuration: {
          layouts: {
            list: string[];
            edit: LayoutField[][];
          };
        },
      ) => Promise<unknown>;
    };

    const contentType = contentTypes.findContentType(uid);
    const configuration = await contentTypes.findConfiguration(contentType);
    const optionGroups = [
      ['showFormulas', 'formulas'],
      ['showSkinType', 'skinTypes'],
      ['showSetInclude', 'setIncludes'],
      ['showChooseFinish', 'finishes'],
      ['showSize', 'sizes'],
    ] as const;
    const edit = optionGroups.reduce(
      (layout, [toggle, list]) => placeFieldBefore(layout, toggle, list),
      placeFieldBefore(configuration.layouts.edit, 'badges', 'showFormulas'),
    );

    if (JSON.stringify(edit) !== JSON.stringify(configuration.layouts.edit)) {
      await contentTypes.updateConfiguration(contentType, {
        layouts: {
          ...configuration.layouts,
          edit,
        },
      });
    }

    await allowPublicRead(strapi);
    await seedCategories(strapi);
    await seedAnnouncements(strapi);
  },
};
