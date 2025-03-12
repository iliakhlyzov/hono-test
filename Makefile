.PHONY: up down build logs restart ps shell

# Start containers in detached mode.
# If CONTAINER is specified, starts only that service.
start:
	docker-compose up -d $(CONTAINER)

# Stop and remove containers, networks, volumes, and images created by up.
stop:
	docker-compose stop

down:
	docker-compose down

# Build container images.
# If CONTAINER is specified, builds only that service.
build:
	docker-compose build $(CONTAINER)

# Follow logs of containers.
# If CONTAINER is specified, follows logs for that service.
logs:
ifdef CONTAINER
	docker-compose logs -f $(CONTAINER)
else
	docker-compose logs -f
endif

# Restart containers.
# If CONTAINER is specified, restarts only that service.
restart:
ifdef CONTAINER
	docker-compose restart $(CONTAINER)
else
	docker-compose restart
endif

# Show status of containers.
ps:
	docker-compose ps

# Open an interactive shell session in the specified container.
shell:
ifdef CONTAINER
	docker-compose exec $(CONTAINER) sh
else
	@echo "Usage: make shell CONTAINER=<container_name>"
endif
