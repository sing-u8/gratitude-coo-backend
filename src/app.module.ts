import { join } from "node:path";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as Joi from "joi";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import { Comment } from "./comment/entity/comment.entity";
import { envVarKeys } from "./common/const/env.const";
import { GratitudeLike } from "./gratitude/entity/gratitude-like.entity";
import { GratitudePost } from "./gratitude/entity/gratitude-post.entity";
import { AuthModule } from "./member/auth/auth.module";
import { Member } from "./member/entity/member.entity";
import { MemberModule } from "./member/member.module";

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
				entities: [Member, GratitudePost, GratitudeLike, Comment],
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

		AuthModule,

		MemberModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
