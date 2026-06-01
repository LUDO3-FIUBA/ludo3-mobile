.PHONY: up-android up-ios prebuild start

test:
	cd e2e/tests && npm run test
.PHONY: test

up-android:
	npx expo run:android

up-ios:
	npx expo run:ios

prebuild:
	npx expo prebuild --clean

start:
	npx expo start --dev-client --clear
