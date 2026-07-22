# This site's theme (loikein/hugo-tufte) is unmaintained and only builds on the
# ~0.128-era Hugo. Newer Hugo (>=0.146) reworked partial-name resolution, which
# sends the theme into infinite template recursion -> the build eats memory and
# hangs. So we pin a project-local Hugo binary here and drive it through make.
#
# Do NOT run a bare `hugo` in this repo if your global install is newer than
# 0.145 — it will hang. Use `make build` / `make serve` instead.
#
# CI (.github/workflows) already pins the same version independently.

HUGO_VERSION := 0.128.0
HUGO         := ./bin/hugo
PLATFORM     := linux-amd64
TARBALL      := hugo_extended_$(HUGO_VERSION)_$(PLATFORM).tar.gz
HUGO_URL     := https://github.com/gohugoio/hugo/releases/download/v$(HUGO_VERSION)/$(TARBALL)

.PHONY: build serve drafts clean setup version

## setup: download the pinned Hugo binary into ./bin (run once, or after clone)
setup:
	@mkdir -p bin
	@echo "Fetching Hugo $(HUGO_VERSION) (extended) -> $(HUGO)"
	@curl -sL --fail -o /tmp/$(TARBALL) "$(HUGO_URL)"
	@tar xzf /tmp/$(TARBALL) -C bin hugo
	@rm -f /tmp/$(TARBALL)
	@$(HUGO) version

## build: production build into ./public
build: $(HUGO)
	$(HUGO) --minify

## serve: local dev server with drafts + future-dated posts
serve: $(HUGO)
	$(HUGO) server --buildDrafts --buildFuture

## drafts: build including drafts/future posts
drafts: $(HUGO)
	$(HUGO) --buildDrafts --buildFuture

## clean: remove generated output
clean:
	rm -rf public resources/_gen .hugo_build.lock

## version: show the pinned Hugo version
version: $(HUGO)
	@$(HUGO) version

# Auto-fetch the binary if it's missing (e.g. fresh clone).
$(HUGO):
	@$(MAKE) setup
