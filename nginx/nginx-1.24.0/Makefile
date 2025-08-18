
default:	build

clean:
	rm -rf Makefile objs

.PHONY:	default clean

build:
	$(MAKE) -f objs/Makefile

install:
	$(MAKE) -f objs/Makefile install

modules:
	$(MAKE) -f objs/Makefile modules

upgrade:
	/workspace/competitions/AIC_2025/SIU_Pumpking/nginx/sbin/nginx -t

	kill -USR2 `cat /workspace/competitions/AIC_2025/SIU_Pumpking/nginx/logs/nginx.pid`
	sleep 1
	test -f /workspace/competitions/AIC_2025/SIU_Pumpking/nginx/logs/nginx.pid.oldbin

	kill -QUIT `cat /workspace/competitions/AIC_2025/SIU_Pumpking/nginx/logs/nginx.pid.oldbin`

.PHONY:	build install modules upgrade
