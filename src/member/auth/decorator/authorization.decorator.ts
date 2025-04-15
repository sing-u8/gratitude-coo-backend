import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const Authorization = createParamDecorator(
	(_, context: ExecutionContext) => {
		const req = context.switchToHttp().getRequest();

		return req.headers.authorization;
	},
);
