cmake_minimum_required(VERSION 3.8)

option(APP_NAME "Project Name" "cx3-so")
project(${APP_NAME} CXX)

include(${CMAKE_CURRENT_LIST_DIR}/common/CMakeLists.txt)


set(LIB_NAME cocos)

set(PROJ_SOURCES
    ${CMAKE_CURRENT_LIST_DIR}/../../../cx-native/cxCreator.h
    ${CMAKE_CURRENT_LIST_DIR}/../../../cx-native/cxCreator.cpp
    ${CMAKE_CURRENT_LIST_DIR}/../../../cx-native/cxDefine.h
    ${CMAKE_CURRENT_LIST_DIR}/../../../cx-native/cxIntf.h
    ${CMAKE_CURRENT_LIST_DIR}/../../../cx-native/cxIntf.cpp
    ${CMAKE_CURRENT_LIST_DIR}/../../../cx-native/cxJsb.hpp
    ${CMAKE_CURRENT_LIST_DIR}/../../../cx-native/cxJsb.cpp
    ${CMAKE_CURRENT_LIST_DIR}/../../../cx-native/Game.h
    ${CMAKE_CURRENT_LIST_DIR}/../../../cx-native/Game.cpp
    ${CMAKE_CURRENT_LIST_DIR}/../../../cx-native/jsb_module_register.cpp
    ${CMAKE_CURRENT_LIST_DIR}/jni/main.cpp
)

# -------------- SRART ---------------
# USED BY COCOS SERVICE, DON'T REMOVE!
if(EXISTS ${RES_DIR}/service.cmake)
    set(SERVICE_NATIVE_DIR ${CMAKE_CURRENT_LIST_DIR})
    include(${RES_DIR}/service.cmake)
endif()
# --------------  END ----------------

#list(APPEND PROJ_SOURCES
#    ${CMAKE_CURRENT_LIST_DIR}/../../../cx-native/jsb_module_register.cpp
#)

add_library(${LIB_NAME} SHARED ${PROJ_SOURCES})

# -------------- SRART ---------------
# USED BY COCOS SERVICE, DON'T REMOVE!
if(COMMAND service_insert_library)
    service_insert_library()
endif()
# --------------  END ----------------

target_link_libraries(${LIB_NAME}
    "-Wl,--whole-archive" cocos2d_jni "-Wl,--no-whole-archive"
    cocos2d
)

target_include_directories(${LIB_NAME} PRIVATE
    ${CMAKE_CURRENT_LIST_DIR}/../../../cx-native
)
