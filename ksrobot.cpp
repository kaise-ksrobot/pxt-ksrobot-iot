#include "pxt.h"

using namespace pxt;

//% weight=10 color=#00A6F0 icon="\uf085"
namespace kslib
{
    //%
    void forever_stub(void *a)
    {
        //setThreadName("forever_stub");
        runAction0((Action)a);
        //threadSleep(MS2ST(20));
    }

    //%
    void forever(Action a)
    {
        if (a != 0)
        {
            incr(a);
            create_fiber(forever_stub, (void *)a);
            //thread_t *thr = (thread_t *)malloc(400);
            //createThread((void *)thr, 400, 20, forever_stub, (void *)a);
        }
    }

    //%
    int mb_version()
    {
#if MICROBIT_CODAL
        return 0;
#else
        return 1;
#endif
    }

} // namespace kslib
