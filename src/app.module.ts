import { join } from "node:path";
import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as Joi from "joi";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";

import { envVarKeys } from "./common/const/env.const";

import { GratitudeLike } from "./gratitude/entity/gratitude-like.entity";
import { GratitudePost } from "./gratitude/entity/gratitude-post.entity";
import { GratitudeComment } from "./gratitude/entity/gratitude-comment.entity";
import { Member } from "./member/entity/member.entity";

import { AuthModule } from "./member/auth/auth.module";
import { MemberModule } from "./member/member.module";
import { GratitudeModule } from "./gratitude/gratitude.module";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./member/auth/guard/auth.guard";
import { BearerTokenMiddleware } from "./member/auth/middleware/bearer-token.middleware";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
			validationSchema: Joi.object({
				NODE_ENV: Joi.string()
					.valid("development", "production", "test")
					.default("development"),
				PORT: Joi.string().default("3000"),
				DB_TYPE: Joi.string().valid("postgres").required(),
				DB_HOST: Joi.string().required(),
				DB_PORT: Joi.number().required(),
				DB_USERNAME: Joi.string().required(),
				DB_PASSWORD: Joi.string().required(),
				DB_DATABASE: Joi.string().required(),
				HASH_ROUNDS: Joi.number().required(),
				ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
				REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
				JWT_SECRET: Joi.string().required(),
				JWT_REFRESH_SECRET: Joi.string().required(),
			}),
		}),
		TypeOrmModule.forRootAsync({
			useFactory: (configService: ConfigService) => ({
				type: configService.get<string>(envVarKeys.DB_TYPE) as "postgres",
				host: configService.get<string>(envVarKeys.DB_HOST),
				port: configService.get<number>(envVarKeys.DB_PORT),
				username: configService.get<string>(envVarKeys.DB_USERNAME),
				password: configService.get<string>(envVarKeys.DB_PASSWORD),
				database: configService.get<string>(envVarKeys.DB_DATABASE),
				entities: [Member, GratitudePost, GratitudeLike, GratitudeComment],
				synchronize: true,
				autoLoadEntities: true,
			}),
			inject: [ConfigService],
		}),

		WinstonModule.forRoot({
			level: "debug",
			transports: [
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.colorize({
							all: true,
						}),
						winston.format.timestamp(),
						winston.format.printf(
							(info) =>
								`${info.timestamp} [${info.context}] ${info.level} ${info.message}`,
						),
					),
				}),
				new winston.transports.File({
					dirname: join(process.cwd(), "logs"),
					filename: "logs.log",
					format: winston.format.combine(
						winston.format.timestamp(),
						winston.format.printf(
							(info) =>
								`${info.timestamp} [${info.context}] ${info.level} ${info.message}`,
						),
					),
				}),
			],
		}),
		CacheModule.register({
			ttl: 1000,
			isGlobal: true,
		}),
		AuthModule,
		MemberModule,
		GratitudeModule,
	],
	controllers: [],
	providers: [
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(BearerTokenMiddleware)
			.exclude(
				{
					path: "auth/login",
					method: RequestMethod.POST,
				},
				{
					path: "auth/register",
					method: RequestMethod.POST,
				},
			)
			.forRoutes("*");
	}
}
