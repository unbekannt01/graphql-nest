import { Extensions, Field, InputType } from '@nestjs/graphql';
import { checkRoleMiddleware } from 'src/auth/middlewares/checkRole.middleware';
import { Roles } from 'src/auth/guards/role.guard';

@InputType()
export class RegisterUserArgs {
  // @Extensions({ complexity: 3 })
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field({ middleware: [checkRoleMiddleware] })
  @Extensions({ role: Roles.ADMIN })
  password: string;

  @Field({ defaultValue: 'USER' })
  role: string;
}
