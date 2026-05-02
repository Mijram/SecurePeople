package com.securepeople.newarchitecture

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.securepeople.BuildConfig

class MainApplicationReactNativeHost(application: Application) :
    ReactNativeHost(application) {

    override fun getUseDeveloperSupport() = BuildConfig.DEBUG

    override fun getPackages(): List<ReactPackage> {
        val packages = PackageList(this).packages
        return packages
    }

    override fun getJSMainModuleName() = "index"
}
