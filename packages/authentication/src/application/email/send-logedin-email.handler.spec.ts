import { Test, TestingModule } from '@nestjs/testing';
import { SendLogedInEmailHanlder } from './send-logedin-email.handler';
import { NotifyProxy } from '../../infrastructure/proxy/notifi.proxy';
import { SendLogedInEmailCommand } from '../../domain/email/command/send-logedin-email.command';

describe('SendLogedInEmailHanlder', () => {
  let handler: SendLogedInEmailHanlder;
  let notifyProxy: NotifyProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendLogedInEmailHanlder,
        {
          provide: NotifyProxy,
          useValue: { sendEmail: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<SendLogedInEmailHanlder>(SendLogedInEmailHanlder);
    notifyProxy = module.get<NotifyProxy>(NotifyProxy);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call notifyProxy.sendEmail with correct parameters', async () => {
    const command = new SendLogedInEmailCommand('test@example.com');
    await handler.execute(command);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(notifyProxy.sendEmail).toHaveBeenCalledWith(
      'test@example.com',
      'User just logedin to our system',
      'User just logedin to our system',
    );
  });
});
