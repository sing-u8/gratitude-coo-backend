import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import * as process from 'node:process';

@Module({
	imports: [
		ConfigModule.forRoot(
			{
				isGlobal: true,
				envFilePath: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
			}
		)
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
