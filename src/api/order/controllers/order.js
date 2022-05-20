"use strict";
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const { amount, address, dishes, token } = ctx.request.body.data;
    try {
      await stripe.charges.create({
        amount: amount,
        currency: "eur",
        description: `Order ${new Date()} by ${ctx.state.user.id}`,
        source: token,
      });

      const entity = await strapi
        .service("api::order.order")
        .create({ amount, address, dishes, user: ctx.state.user.id });
      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (err) {
      ctx.response.status = 500;
      return { error: { message: "There was a problem creating the charge" } };
    }
  },
}));
