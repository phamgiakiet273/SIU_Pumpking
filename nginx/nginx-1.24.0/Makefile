
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
	/mnt/e/SIU_Pumpking/SIU_Pumpking/nginx/sbin/nginx -t

	kill -USR2 `cat /mnt/e/SIU_Pumpking/SIU_Pumpking/nginx/logs/nginx.pid`
	sleep 1
	test -f /mnt/e/SIU_Pumpking/SIU_Pumpking/nginx/logs/nginx.pid.oldbin

	kill -QUIT `cat /mnt/e/SIU_Pumpking/SIU_Pumpking/nginx/logs/nginx.pid.oldbin`

.PHONY:	build install modules upgrade
