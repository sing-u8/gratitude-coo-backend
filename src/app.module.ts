import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import { join } from "node:path";
import * as Joi from 'joi';
import { TypeOrmModule } from "@nestjs/typeorm";
import { envVarKeys } from "./common/const/env.const";
import { GratitudePost } from "./gratitude/entity/gratitude-post.entity";
import { Member } from "./member/entity/member.entity";
import { GratitudeLike } from "./gratitude/entity/gratitude-like.entity";
import { Comment } from "./comment/entity/comment.entity";
@Module({
	imports: [
		ConfigModule.forRoot(
			{
				isGlobal: true,
				envFilePath: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
				validationSchema: Joi.object({
					NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
					PORT: Joi.string().default('3000'),
					DB_TYPE: Joi.string().valid('postgres').required(),
					DB_HOST: Joi.string().required(),
					DB_PORT: Joi.number().required(),
					DB_USERNAME: Joi.string().required(),
					DB_PASSWORD: Joi.string().required(),
					DB_DATABASE: Joi.string().required(),
				})
			}
		),
		TypeOrmModule.forRootAsync({
			useFactory: (configService: ConfigService) => ({
				type: configService.get<string>(envVarKeys.DB_TYPE) as "postgres",
				host: configService.get<string>(envVarKeys.DB_HOST),
				port: configService.get<number>(envVarKeys.DB_PORT),
				username: configService.get<string>(envVarKeys.DB_USERNAME),
				password: configService.get<string>(envVarKeys.DB_PASSWORD),
				database: configService.get<string>(envVarKeys.DB_DATABASE),
				entities: [
					Member,
					GratitudePost,
					GratitudeLike,
					Comment,
				],
				synchronize: configService.get<string>(envVarKeys.NODE_ENV) !== "production",
				autoLoadEntities: true,
			}),
			inject: [ConfigService],
		}),
	
		// WinstonModule.forRoot({
		// 	level: 'debug',
		// 	transports: [
		// 	  new winston.transports.Console({
		// 		format: winston.format.combine(
		// 		  winston.format.colorize({
		// 			all: true,
		// 		  }),
		// 		  winston.format.timestamp(),
		// 		  winston.format.printf(
		// 			(info) =>
		// 			  `${info.timestamp} [${info.context}] ${info.level} ${info.message}`,
		// 		  ),
		// 		),
		// 	  }),
		// 	  new winston.transports.File({
		// 		dirname: join(process.cwd(), 'logs'),
		// 		filename: 'logs.log',
		// 		format: winston.format.combine(
		// 		  winston.format.timestamp(),
		// 		  winston.format.printf(
		// 			(info) =>
		// 			  `${info.timestamp} [${info.context}] ${info.level} ${info.message}`,
		// 		  ),
		// 		),
		// 	  }),
		// 	],
		//   }),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
