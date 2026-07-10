SHELL := /bin/bash

YTGIFY_DEV_HOST ?= localhost
YTGIFY_DEV_PORT ?= 3000
YTGIFY_DEV_URL ?= http://$(YTGIFY_DEV_HOST):$(YTGIFY_DEV_PORT)

YTGIFY_RUN_DIR ?= .ytgify-runtime
YTGIFY_DEV_PID ?= $(YTGIFY_RUN_DIR)/ytgify-dev.pid
YTGIFY_DEV_LOG ?= $(YTGIFY_RUN_DIR)/ytgify-dev.log
YTGIFY_DEV_TMUX_SESSION ?= ytgify-dev

START_DEV_CMD = npm run dev -- -H $(YTGIFY_DEV_HOST) -p $(YTGIFY_DEV_PORT)

.PHONY: help start-dev start-dev-bg status-dev logs-dev stop-dev dev validate

help:
	@printf "YTgify local targets:\n"
	@printf "  make start-dev      Start Next.js dev server in the foreground\n"
	@printf "  make start-dev-bg   Start persistent dev server in tmux, or nohup fallback\n"
	@printf "  make status-dev     Show persistent dev server status\n"
	@printf "  make logs-dev       Show recent persistent dev server logs\n"
	@printf "  make stop-dev       Stop persistent dev server\n"
	@printf "  make validate       Run lint, typecheck, build, and tests\n"

dev: start-dev

start-dev:
	$(START_DEV_CMD)

start-dev-bg:
	@mkdir -p "$(YTGIFY_RUN_DIR)"
	@if command -v tmux >/dev/null 2>&1; then \
		if tmux has-session -t "$(YTGIFY_DEV_TMUX_SESSION)" 2>/dev/null; then \
			echo "ytgify dev already running in tmux session $(YTGIFY_DEV_TMUX_SESSION)"; \
			echo "$(YTGIFY_DEV_URL)"; \
		else \
			rm -rf .next; \
			tmux new-session -d -s "$(YTGIFY_DEV_TMUX_SESSION)" -c "$$(pwd)" '$(START_DEV_CMD)'; \
			rm -f "$(YTGIFY_DEV_PID)"; \
			echo "ytgify dev started in tmux session $(YTGIFY_DEV_TMUX_SESSION)"; \
			echo "$(YTGIFY_DEV_URL)"; \
			echo "Attach with: tmux attach -t $(YTGIFY_DEV_TMUX_SESSION)"; \
		fi; \
	else \
		if [ -f "$(YTGIFY_DEV_PID)" ] && kill -0 "$$(cat "$(YTGIFY_DEV_PID)")" 2>/dev/null; then \
			echo "ytgify dev already running with PID $$(cat "$(YTGIFY_DEV_PID)")"; \
			echo "$(YTGIFY_DEV_URL)"; \
		else \
			rm -rf .next; \
			nohup $(START_DEV_CMD) >"$(YTGIFY_DEV_LOG)" 2>&1 & \
			echo $$! >"$(YTGIFY_DEV_PID)"; \
			echo "ytgify dev started with PID $$(cat "$(YTGIFY_DEV_PID)")"; \
			echo "$(YTGIFY_DEV_URL)"; \
		fi; \
	fi

status-dev:
	@if command -v tmux >/dev/null 2>&1 && tmux has-session -t "$(YTGIFY_DEV_TMUX_SESSION)" 2>/dev/null; then \
		echo "ytgify dev running in tmux session $(YTGIFY_DEV_TMUX_SESSION)"; \
		echo "$(YTGIFY_DEV_URL)"; \
	elif [ -f "$(YTGIFY_DEV_PID)" ] && kill -0 "$$(cat "$(YTGIFY_DEV_PID)")" 2>/dev/null; then \
		echo "ytgify dev running with PID $$(cat "$(YTGIFY_DEV_PID)")"; \
		echo "$(YTGIFY_DEV_URL)"; \
	else \
		echo "ytgify dev is not running"; \
		exit 1; \
	fi

logs-dev:
	@if command -v tmux >/dev/null 2>&1 && tmux has-session -t "$(YTGIFY_DEV_TMUX_SESSION)" 2>/dev/null; then \
		tmux capture-pane -pt "$(YTGIFY_DEV_TMUX_SESSION):0" -S -120; \
	elif [ -f "$(YTGIFY_DEV_LOG)" ]; then \
		tail -120 "$(YTGIFY_DEV_LOG)"; \
	else \
		echo "No ytgify dev logs found"; \
		exit 1; \
	fi

stop-dev:
	@if command -v tmux >/dev/null 2>&1 && tmux has-session -t "$(YTGIFY_DEV_TMUX_SESSION)" 2>/dev/null; then \
		tmux kill-session -t "$(YTGIFY_DEV_TMUX_SESSION)"; \
		echo "Stopped tmux session $(YTGIFY_DEV_TMUX_SESSION)"; \
	elif [ -f "$(YTGIFY_DEV_PID)" ] && kill -0 "$$(cat "$(YTGIFY_DEV_PID)")" 2>/dev/null; then \
		kill "$$(cat "$(YTGIFY_DEV_PID)")"; \
		rm -f "$(YTGIFY_DEV_PID)"; \
		echo "Stopped ytgify dev PID"; \
	else \
		rm -f "$(YTGIFY_DEV_PID)"; \
		echo "ytgify dev was not running"; \
	fi

validate:
	npm run lint
	npm run typecheck
	npm run build
	npm test
