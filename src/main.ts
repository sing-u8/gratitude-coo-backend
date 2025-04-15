import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ["verbose"],
	});

	// Setup Swagger
	const config = new DocumentBuilder()
		.setTitle("Gratitude-Coo API")
		.setDescription("The API for the Gratitude-Coo application")
		.setVersion("1.0")
		.addTag("gratitude-coo")
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api", app, documentFactory);

	app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
