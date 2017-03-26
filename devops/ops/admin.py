from django.contrib import admin
# Register your models here.
from .models import  UserInfo,HostInfo,HardWareInfo,UserLock,PushCodeEvent,TopContServer
import hashlib

class UserInfoAdmin(admin.ModelAdmin):
    fieldsets = (
        ("main",{
          'fields': ('user','pwd','group' ),
        }),
        ("Other",{
            'fields': ('phone','email','user_type','hdimg')
        }),
    )

    def save(self, *args, **kwargs):
        pwd = hashlib.sha1(self.pwd + self.user).hexdigest()
        super(UserInfo).save(*args, **kwargs)



admin.site.register(UserInfo,UserInfoAdmin)
admin.site.register(HostInfo)
admin.site.register(HardWareInfo)
admin.site.register(UserLock)
admin.site.register(PushCodeEvent)
admin.site.register(TopContServer)

