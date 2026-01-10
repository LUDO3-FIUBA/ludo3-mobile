.PHONY: up-android up-ios

up-android:
	npm install
	npm run android

up-ios:
	cd ios && export LANG=en_US.UTF-8 && pod install
	npx react-native run-ios
