#include "pxt.h"
using namespace pxt;
namespace KSRobotCPP
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
#endif

        return 1;
    }

} // namespace KSRobotCPP
