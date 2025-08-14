import * as argon from 'argon2';
import config from 'config';

export class PasswordUtil {
    private static secret: Buffer = Buffer.from(config.get<string>('argon.argonSecretKey'));

    static async hashPassword(password: string): Promise<string> {
        return argon.hash(password, { secret: PasswordUtil.secret });
    }

    static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        return argon.verify(hashedPassword, password, { secret: PasswordUtil.secret });
    }
}
