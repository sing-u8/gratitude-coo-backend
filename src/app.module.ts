import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import * as process from 'node:process';
import { z } from 'zod';

@Module({
	imports: [
		ConfigModule.forRoot(
			{
				isGlobal: true,
				envFilePath: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
				validationSchema: z.object({
					// Define your environment variables here
					NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
				})
			}
		)
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
