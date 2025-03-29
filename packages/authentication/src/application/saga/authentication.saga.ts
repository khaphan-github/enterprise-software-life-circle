import { Injectable } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AssignDefaultRoleToUserCommand } from '../../domain/role/command/assign-default-role-to-user.command';
import { UserCreatedEvent } from '../../domain/user/events/user-created.event';

@Injectable()
export class AuthenticationSaga {
  @Saga()
  userCreatedThenBuildUserRole = (events$: Observable<any>) => {
    return events$.pipe(
      ofType(UserCreatedEvent),
      map((event) => {
        return new AssignDefaultRoleToUserCommand([event.entity]);
      }),
    );
  };

  // @Saga()
  // userLoginFails = (events$: Observable<any>) => {
  //   return events$.pipe(
  //     ofType(UserLoginFailEvent),
  //     map((event) => {
  //       return new SendLogedInEmailCommand(event.userDomain.email);
  //     }),
  //   );
  // };
}
