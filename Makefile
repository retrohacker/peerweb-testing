.SILENT:
help:
	echo
	echo "NodeSource Metrics Server Make commands"
	echo
	echo "  Commands: "
	echo
	echo "    help  - show this message"
	echo "    run   - run the PeerWeb browser from source"
	echo "    test  - run the PeerWeb tests on the current source"
	echo "    build - cut a release of PeerWeb"
	echo "    clean - clean all build dependencies"

clean:
	rm -rf node_modules
	rm -rf build/*
	docker ps -a | grep "peerweb\:build" | awk '{print $$1}' | xargs docker rm
	docker rmi peerweb:build

run:
	npm install
	npm start

test:
	npm install
	npm test

.PHONY: build
build:
	echo "Hello World"
	docker build -t peerweb:build .
	rm -rf build/*
	docker run -it -v build:/usr/src/app/build peerweb:build


deps:
	echo "  Dependencies: "
	echo
	echo "    * docker $(shell which docker > /dev/null || echo '- \033[31mNOT INSTALLED\033[37m')"
	echo "    * node $(shell which node > /dev/null || echo '- \033[31mNOT INSTALLED\033[37m')"
	echo "    * npm $(shell which npm > /dev/null || echo '- \033[31mNOT INSTALLED\033[37m')"
	echo
