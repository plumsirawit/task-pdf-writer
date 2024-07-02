FROM public.ecr.aws/lambda/nodejs:20

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN mkdir /app
COPY src /app/src/
COPY static_min/template.html /app/template.html
COPY package.json /app/package.json
COPY pnpm-lock.yaml /app/pnpm-lock.yaml
COPY tsconfig.json /app/tsconfig.json
WORKDIR /app
RUN pnpm install
RUN pnpm build
RUN cp -a /app/dist/* ${LAMBDA_TASK_ROOT}
RUN cp -a /app/node_modules ${LAMBDA_TASK_ROOT}/node_modules/
RUN mv /app/template.html ${LAMBDA_TASK_ROOT}/template.html
WORKDIR ${LAMBDA_TASK_ROOT}
CMD [ "index.handler" ]