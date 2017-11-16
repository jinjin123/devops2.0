import os,djcelery
from ops.views import ssh_settings
# from django.utils.translation import ugettext_lazy as _
# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.join(
    os.path.realpath(os.path.dirname(__file__)), os.pardir)

djcelery.setup_loader()

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.10/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'o8kebkpiacs!v+yaw8x=0qz4rdf9e#o-y0qz!)t8n5wy(bj4if'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']
AUTH_USER_MODEL = 'ops.UserInfo'

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'ops',
    'djcelery',
    'django_crontab',
    # 'api',
    'rest_framework',
    'xadmin',
    'crispy_forms',
    'reversion'
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAdminUser',
        # 'rest_framework.authentication.TokenAuthentication',
        # 'rest_framework.authentication.SessionAuthentication',
    ],
    'PAGE_SIZE': 10
}

MIDDLEWARE_CLASSES = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware'
]

ROOT_URLCONF = 'devops.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.i18n',
                'django.template.context_processors.media',
                'django.template.context_processors.static',
                'django.template.context_processors.tz',
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.core.context_processors.media',
            ],
        },
    },
]
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(BASE_DIR, 'static/'),
)

WSGI_APPLICATION = 'devops.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.10/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# CACHES = {
#     'default': {
#         'BACKEND': 'django_redis.cache.RedisCache',
#         'LOCATION': 'redis://192.168.1.101:6379/1',
#         "OPTIONS": {
#             'DB':0,
#             "CLIENT_CLASS": "django_redis.client.DefaultClient",
#         },
#     },
# }


# Password validation
# https://docs.djangoproject.com/en/1.10/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/
# gettext_noop = lambda s: s
# LOCALE_PATHS = [
#     '/Users/wupeijin/code3/django-tornado/devops/xadmin/locale',
# ]
# LANGUAGE_CODE = 'en-us'
# PAGE_LANGUAGES = (
#     ('zh-cn', gettext_noop('Chinese Simplified')),
#     ('fr-ch', gettext_noop('Swiss french')),
#     ('en-us', gettext_noop('US English')),
# )
LANGUAGE_CODE = 'en-us'

LANGUAGES = (
     ('en', ('English')),
     ('zh-hans', ('Chinese')),
)


TIME_ZONE = 'Asia/Shanghai'
USE_I18N = True
USE_L10N = True
USE_TZ = False
# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.10/howto/static-files/

STATIC_URL = '/static/'
# STATIC_ROOT = "/Users/wupeijin/code3/django-tornado/devops/static/"
MEDIA_URL= '%s' % (ssh_settings.upload_dir + '/')
## media ROOT  need to set  for  upload_to  'path'
MEDIA_ROOT = MEDIA_URL

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
       'standard': {
            'format': '%(asctime)s [%(threadName)s:%(thread)d] [%(name)s:%(lineno)d] [%(module)s:%(funcName)s] [%(levelname)s]- %(message)s'}
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': '/tmp/django.log',
            'formatter':'standard',
        },
        'crontab': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': '/tmp/crontab.log',
            'formatter': 'standard'
        },
    },
    'loggers': {
        'django_crontab': {
            'handlers': ['crontab'],
            'level': 'DEBUG',
            'propagate': False
        },
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': False
        },
        'django.request': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

#enable session cookies
SESSION_SAVE_EVERY_REQUEST = True
#expire 30 mins
SESSION_COOKIE_AGE=60*300
#close browser  = del cookies
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

DOCKER_API_PORT = '2375'
HOST_IP_ADDR = 'localhost'
LOGIN_URL = '/'

# CELERY
BROKER_URL = 'redis://%s:%d' % (ssh_settings.redisip,ssh_settings.redisport)
CELERY_RESULT_BACKEND = 'redis://%s:%d'% (ssh_settings.redisip,ssh_settings.redisport)
# BROKER_URL = 'redis://%s:%d' % (ssh_settings.redisip,12345)
# CELERY_RESULT_BACKEND = 'redis://%s:%d'% (ssh_settings.redisip,12345)
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Asia/Shanghai'

CRONJOBS = (
    ('*/5 * * * *', 'ops.views.views.interval_check_ssh'),
)
