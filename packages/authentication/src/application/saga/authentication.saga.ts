import { Injectable, Logger } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AssignDefaultRoleToUserCommand } from '../../domain/role/command/assign-default-role-to-user.command';
import { UserCreatedEvent } from '../../domain/user/events/user-created.event';
import { UserLoginFailEvent } from '../../domain/user/events/user-login-fail.event';
import { UserLogedinEvent } from '../../domain/user/events/user-logedin.event';
import { TokenCreatedEvent } from '../../domain/user/events/token-created.event';
import { UserRoleEntityCreatedEvent } from '../../domain/role/event/user-entity-created.event';
import { RoleEntityCreatedEvent } from '../../domain/role/event/role-created.event';
import { EndpointsAssignedToRolesEvent } from '../../domain/role/event/endpoints-assigned-to-roles.event';
import { EndpointsAddedToRolesEvent } from '../../domain/role/event/endpoints-added-to-roles.event';
import { ActionsAssignedToRolesEvent } from '../../domain/role/event/actions-assigned-to-roles.event';
import { EndpointEntityUpdatedEvent } from '../../domain/endpoint/event/endpoint-updated.event';
import { EndpointEntityDeletedEvent } from '../../domain/endpoint/event/endpoint-deleted.event';
import { EndpointEntityCreatedEvent } from '../../domain/endpoint/event/endpoint-created.event';
import { ActionUpdatedEvent } from '../../domain/action/events/action-updated.event';
import { ActionDeletedEvent } from '../../domain/action/events/action-deleted.event';
import { ActionCreatedEvent } from '../../domain/action/events/action-created.event';

@Injectable()
export class AuthenticationSaga {
  private readonly logger = new Logger(AuthenticationSaga.name);
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
  logEventDispatch = (events$: Observable<any>) => {
    return events$.pipe(
      ofType(
        UserCreatedEvent,
        UserLoginFailEvent,
        UserLogedinEvent,
        TokenCreatedEvent,
        UserRoleEntityCreatedEvent,
        RoleEntityCreatedEvent,
        EndpointsAssignedToRolesEvent,
        EndpointsAddedToRolesEvent,
        ActionsAssignedToRolesEvent,
        EndpointEntityUpdatedEvent,
        EndpointEntityDeletedEvent,
        EndpointEntityCreatedEvent,
        ActionUpdatedEvent,
        ActionDeletedEvent,
        ActionCreatedEvent,
      ),
      map((event) => {
        this.logger.log('Event dispatched:', event.constructor.name, event);
        return null; // No command to dispatch, just logging
      }),
    );
  };
}
