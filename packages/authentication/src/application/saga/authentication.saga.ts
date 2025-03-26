import { Injectable } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SendLogedInEmailCommand } from '../../domain/email/command/send-logedin-email.command';
import { SendWellcomeEmailCommand } from '../../domain/email/command/send-wellcome-email.command';
import { AssignDefaultRoleToUserCommand } from '../../domain/role/command/assign-default-role-to-user.command';
import { UserCreatedEvent } from '../../domain/user/events/user-created.event';
import { UserLogedinEvent } from '../../domain/user/events/user-logedin.event';

@Injectable()
export class AuthenticationSaga {
  @Saga()
  userCreatedThenSendNotify = (events$: Observable<any>) => {
    return events$.pipe(
      ofType(UserCreatedEvent),
      map((event) => {
        return new SendWellcomeEmailCommand(event.entity.email);
      }),
    );
  };

  @Saga()
  userCreatedThenBuildUserRole = (events$: Observable<any>) => {
    return events$.pipe(
      ofType(UserCreatedEvent),
      map((event) => {
        return new AssignDefaultRoleToUserCommand([event.entity]);
      }),
    );
  };

  @Saga()
  userLogedIn = (events$: Observable<any>) => {
    return events$.pipe(
      ofType(UserLogedinEvent),
      map((event) => {
        return new SendLogedInEmailCommand(event.entity.email);
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
