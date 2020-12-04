import { defaultFieldResolver } from "graphql";
import { SchemaDirectiveVisitor } from "apollo-server-express";
import { User } from "./database";

export class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: any) {
    const { resolve = defaultFieldResolver } = field;
    const { isAuthenticated, role } = this.args; // The arguments for the directive

    field.resolve = async (
      root: Object,
      args: Object,
      context: { user: User },
      info: Object
    ) => {
      const fieldValue = await resolve(root, args, context, info);
      const { user } = context;

      if (isAuthenticated && !user) {
        return new Error(`Only authenticated users can access ${field.name}`);
      }

      if (role !== user.role) {
        return new Error(
          `Only users with the role ${role} can access ${field.name}`
        );
      }

      return fieldValue;
    };
  }
}
