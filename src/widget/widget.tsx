import { ChangeEvent, FunctionComponent, useEffect, useState } from "react";

interface WiddgetFormProps {
  isChatActive: () => void;
}

interface WidgetChatProps {
  closeChat: () => void;
}

const Widget: FunctionComponent = () => {
  const [isFormActive, setIsFormActive] = useState(false)
  const [isChatActive, setIsChatActive] = useState(false)
  const [isLogged, setIsLogged] = useState(false)

  useEffect(() => {
    const clientWidget = document.getElementById('clientWidget')
    if (clientWidget && !isFormActive) {
      clientWidget.style.flexDirection = 'row'
    } else if (clientWidget && isFormActive) {
      clientWidget.style.flexDirection = 'column'
    }
    const mainDiv = document.getElementById('mainDiv')
    if (mainDiv && (!isFormActive || isChatActive)) {
      mainDiv.style.paddingTop = '0px'
      mainDiv.style.paddingBottom = '0px'
    } else if (mainDiv && (isFormActive || !isChatActive)) {
      mainDiv.style.paddingTop = '20px'
      mainDiv.style.paddingBottom = '20px'
    }
  }, [isFormActive, isChatActive])

  function handleTransitionIn() {
    const widgetHiddenDiv = document.getElementById('WidgetHiddenDiv')
    if (widgetHiddenDiv) {
      widgetHiddenDiv.style.display = 'flex'
    }
  }

  function handleTransitionOut() {
    if (isFormActive || isChatActive) return
    const widgetHiddenDiv = document.getElementById('WidgetHiddenDiv')
    if (widgetHiddenDiv) {
      widgetHiddenDiv.style.display = 'none'
    }
  }

  function handleForm() {
    if (!isLogged) {
      setIsFormActive(!isFormActive)
    } else if (isLogged) {
      setIsChatActive(!isChatActive)
    }
  }

  function handleActiveChat() {
    setIsLogged(true)
    setIsChatActive(true)
    setIsFormActive(false)
  }

  function handleCloseChat() {
    setIsChatActive(false)
  }

  let currentIFrameHeight = 0;
  console.log(currentIFrameHeight)

  const handleReceiveMessage = (event: { data: { eventName: any; payload: any } }) => {
    const eventName = event?.data?.eventName;
    const payload = event?.data?.payload;
  
    if (eventName === 'SET_HEIGHT' && payload?.height) {
      currentIFrameHeight = payload.height;
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleReceiveMessage);

    return () => {
      window.removeEventListener('message', handleReceiveMessage);
    }
  }, [])

  const sendHeight = () => {
    const height = document.body.scrollHeight;
    const widht = document.body.scrollWidth;
    console.log(height, widht);
    window.parent.postMessage({ eventName: 'SET_HEIGHT', payload: { height } }, '*');
  };

  useEffect(() => {
    sendHeight(); // Send height on load

    window.addEventListener('resize', sendHeight); // Send height on resize

    return () => {
      window.removeEventListener('resize', sendHeight);
    };
  }, []);

  return (
    <>
      <div 
        onPointerEnter={handleTransitionIn}
        onPointerLeave={handleTransitionOut}
        id="mainDiv"
        className={`flex flex-col min-[78px] max-h-[80%] bg-[#2A8BF2] rounded-l-3xl absolute bottom-16 right-0 items-center z-10
        ${isFormActive || isChatActive ? 'w-[400px]' : 'w-[78px] hover:w-[218px] pl-1'}`}
      >
        {
          !isChatActive && (
            <div
              id='clientWidget'
              className="flex min-h-[78px] w-full hover:cursor-pointer items-center"
              onClick={handleForm}
            >
              <span className="h-[68px] w-[68px]">
                {closedWidget('68px', '68px')}
              </span>
              <div
                id="WidgetHiddenDiv"
                className="hidden flex-col w-full items-center justify-center"
              >
                <h1 className="text-white text-md font-bold">Fale Conosco</h1>
                <span className="text-white text-xs">Chat Online</span>
              </div>
            </div>
          )
        }
        {
          isFormActive && !isChatActive && (
            <WidgetForm isChatActive={handleActiveChat}/>
          )
        }
        {
          isChatActive && !isFormActive && (
            <WidgetChat closeChat={handleCloseChat}/>
          )
        }
      </div>
    </>
  ) 
}

export default Widget;

const WidgetForm: FunctionComponent<WiddgetFormProps> = ({ isChatActive }) => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)
  const [form, setForm] = useState({
    name: '',
    email: '',
  })

  useEffect(() => {
    if (form.email.length == 0 || form.name.length == 0) {
      setIsButtonDisabled(true)
    } else {
      setIsButtonDisabled(false)
    }
  }, [form])

  function changeForm(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm({...form, [name]: value})
  }

  return (
    <div className="flex flex-col h-[400px] w-full px-12 py-2 items-center justify-between">
      <div className="flex flex-col gap-y-6 items-center">
        <span className="text-white text-xs">Insira suas infos abaixo e vamos conversar.</span>
        <input
          className="h-[44px] w-full px-2 rounded-md" 
          name='name'
          placeholder="Nome completo"
          type="text"
          onChange={e => changeForm(e)}
          value={form.name}
        />
        <input
          className="h-[44px] w-full px-2 rounded-md" 
          name='email'
          placeholder="E-mail"
          type="email"
          onChange={e => changeForm(e)}
          value={form.email}
        />
      </div>
      <div className="flex flex-col w-full gap-y-3 items-center">
        <button
          className="flex h-[44px] w-full bg-white rounded-md items-center justify-center"
          onClick={isChatActive}
          disabled={isButtonDisabled}
        >
          Iniciar conversa
        </button>
        <span className="text-[10px] text-white">Powered by Everest</span>
      </div>
    </div>
  )
}

const WidgetChat: FunctionComponent<WidgetChatProps> = ({ closeChat }) => {
  const [message, setMessage] = useState('')

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target
    setMessage(value)
  }

  return (
    <div className="flex flex-col h-[600px] w-full rounded-l-3xl bg-[#F4F4F4] items-center justify-between">
      <div 
        className="flex h-[70px] w-full px-6 pl-1 gap-x-4 rounded-tl-3xl bg-white items-center"
        onClick={closeChat}
      >
        <span className="h-[48px] w-[48px]">{closedWidget('48px', '48px')}</span>
        <div className="flex flex-col h-[38px] justify-between">
          <h1 className="font-bold text-[20px] leading-[26px]">Everest</h1>
          <span className="text-black font-semibold text-opacity-50 text-[15px] leading-[26px]">
            Responderemos em breve
          </span>
        </div>
      </div>
      <div className="flex h-[70px] w-full px-6 border-t-[1px] border-[#C4C4C4] items-center justify-between">
        <input 
          className="h-full w-full bg-[#F4F4F4]"
          name="message"
          placeholder="Escreva sua mensagem"
          onChange={onChange}
          value={message}
        />
        <div className="flex w-1/5 gap-x-2">
          <button>
            {addIcon()}
          </button>
          <button>
            {sendIcon()}
          </button>
        </div>
      </div>
    </div>
  )
}

function closedWidget(height: string, width: string) {
  return (
    <svg width={width} height={height} viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_27_4984)">
    <circle cx="56" cy="54" r="52" fill="#F4F4F4"/>
    </g>
    <path d="M79.2 31H32.8C29.6013 31 27 33.6373 27 36.8764V72.3266C27 75.5627 29.6013 78.2 32.8 78.2H41.5V90L59.9179 78.2H79.2C82.3987 78.2 85 75.5627 85 72.3236V36.8764C84.9954 35.3152 84.3821 33.8197 83.2947 32.718C82.2073 31.6163 80.7347 30.9984 79.2 31ZM53.1 54.6C53.1 55.7669 52.7598 56.9076 52.1225 57.8779C51.4852 58.8481 50.5794 59.6043 49.5196 60.0509C48.4598 60.4974 47.2936 60.6143 46.1685 60.3866C45.0434 60.159 44.0099 59.5971 43.1988 58.7719C42.3876 57.9468 41.8352 56.8955 41.6114 55.751C41.3877 54.6065 41.5025 53.4203 41.9415 52.3422C42.3805 51.2641 43.1239 50.3426 44.0777 49.6943C45.0315 49.046 46.1529 48.7 47.3 48.7C47.5494 48.7 47.7843 48.7443 48.025 48.7738C48.2628 48.7325 48.5006 48.7 48.75 48.7C49.9037 48.7 51.0101 49.1662 51.8259 49.9961C52.6417 50.8259 53.1 51.9514 53.1 53.125C53.1 53.3787 53.0652 53.6206 53.0275 53.8625C53.0565 54.1074 53.1 54.3493 53.1 54.6ZM64.7 60.5C63.1617 60.5 61.6865 59.8784 60.5988 58.7719C59.5111 57.6655 58.9 56.1648 58.9 54.6C58.9 54.3463 58.9435 54.1074 58.9725 53.8625C58.9293 53.619 58.905 53.3724 58.9 53.125C58.9 51.9514 59.3583 50.8259 60.1741 49.9961C60.9899 49.1662 62.0963 48.7 63.25 48.7C63.4994 48.7 63.7372 48.7325 63.975 48.7738C64.2157 48.7443 64.4506 48.7 64.7 48.7C66.2383 48.7 67.7135 49.3216 68.8012 50.4281C69.8889 51.5345 70.5 53.0352 70.5 54.6C70.5 56.1648 69.8889 57.6655 68.8012 58.7719C67.7135 59.8784 66.2383 60.5 64.7 60.5Z" fill="#2A8BF2"/>
    <defs>
    <filter id="filter0_d_27_4984" x="0" y="0" width="112" height="112" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="2"/>
    <feGaussianBlur stdDeviation="2"/>
    <feComposite in2="hardAlpha" operator="out"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_27_4984"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_27_4984" result="shape"/>
    </filter>
    </defs>
    </svg>
  )
}

function addIcon() {
  return (
    <svg width="29" height="29" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="19.5" cy="19.5" r="19.5" fill="#2A8BF2"/>
    <g filter="url(#filter0_dd_65_1342)">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M26.3252 18.5252H20.4752V12.6752C20.4752 12.136 20.0384 11.7002 19.5002 11.7002C18.962 11.7002 18.5252 12.136 18.5252 12.6752V18.5252H12.6752C12.137 18.5252 11.7002 18.961 11.7002 19.5002C11.7002 20.0394 12.137 20.4752 12.6752 20.4752H18.5252V26.3252C18.5252 26.8644 18.962 27.3002 19.5002 27.3002C20.0384 27.3002 20.4752 26.8644 20.4752 26.3252V20.4752H26.3252C26.8634 20.4752 27.3002 20.0394 27.3002 19.5002C27.3002 18.961 26.8634 18.5252 26.3252 18.5252Z" fill="white"/>
    <mask id="mask0_65_1342" /* style="mask-type:luminance" */ maskUnits="userSpaceOnUse" x="11" y="11" width="17" height="17">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M26.3252 18.5252H20.4752V12.6752C20.4752 12.136 20.0384 11.7002 19.5002 11.7002C18.962 11.7002 18.5252 12.136 18.5252 12.6752V18.5252H12.6752C12.137 18.5252 11.7002 18.961 11.7002 19.5002C11.7002 20.0394 12.137 20.4752 12.6752 20.4752H18.5252V26.3252C18.5252 26.8644 18.962 27.3002 19.5002 27.3002C20.0384 27.3002 20.4752 26.8644 20.4752 26.3252V20.4752H26.3252C26.8634 20.4752 27.3002 20.0394 27.3002 19.5002C27.3002 18.961 26.8634 18.5252 26.3252 18.5252Z" fill="white"/>
    </mask>
    <g mask="url(#mask0_65_1342)">
    <g filter="url(#filter1_dd_65_1342)">
    <rect x="7.7998" y="7.80029" width="23.4" height="23.4" fill="white"/>
    </g>
    </g>
    </g>
    <defs>
    <filter id="filter0_dd_65_1342" x="5.7998" y="6.80029" width="27.4004" height="27.3999" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="1"/>
    <feGaussianBlur stdDeviation="0.5"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_65_1342"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="1"/>
    <feGaussianBlur stdDeviation="1"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0"/>
    <feBlend mode="normal" in2="effect1_dropShadow_65_1342" result="effect2_dropShadow_65_1342"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_65_1342" result="shape"/>
    </filter>
    <filter id="filter1_dd_65_1342" x="5.7998" y="6.80029" width="27.4004" height="27.3999" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="1"/>
    <feGaussianBlur stdDeviation="0.5"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_65_1342"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="1"/>
    <feGaussianBlur stdDeviation="1"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0"/>
    <feBlend mode="normal" in2="effect1_dropShadow_65_1342" result="effect2_dropShadow_65_1342"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_65_1342" result="shape"/>
    </filter>
    </defs>
    </svg>
  )
}

function sendIcon() {
  return (
    <svg width="29" height="29" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="19.6811" cy="19.6811" r="19.6811" fill="#2A8BF2"/>
    <g filter="url(#filter0_dd_65_1339)">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M21.0478 29.0926C21.0305 29.0926 21.0141 29.0918 20.9977 29.091C20.6271 29.0688 20.3179 28.7999 20.2441 28.4358L18.9829 22.2305C18.9173 21.9074 18.6655 21.6556 18.3424 21.59L12.1372 20.328C11.7731 20.255 11.5041 19.9458 11.4819 19.5752C11.4598 19.2037 11.6886 18.8642 12.0412 18.7478L25.1619 14.3745C25.4563 14.2744 25.7811 14.3515 26.0008 14.5721C26.2206 14.7919 26.2969 15.1166 26.1993 15.411L21.8252 28.5317C21.7136 28.8687 21.3987 29.0926 21.0478 29.0926Z" fill="white"/>
    <mask id="mask0_65_1339" /* style="mask-type:luminance" */ maskUnits="userSpaceOnUse" x="11" y="14" width="16" height="16">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M21.0478 29.0926C21.0305 29.0926 21.0141 29.0918 20.9977 29.091C20.6271 29.0688 20.3179 28.7999 20.2441 28.4358L18.9829 22.2305C18.9173 21.9074 18.6655 21.6556 18.3424 21.59L12.1372 20.328C11.7731 20.255 11.5041 19.9458 11.4819 19.5752C11.4598 19.2037 11.6886 18.8642 12.0412 18.7478L25.1619 14.3745C25.4563 14.2744 25.7811 14.3515 26.0008 14.5721C26.2206 14.7919 26.2969 15.1166 26.1993 15.411L21.8252 28.5317C21.7136 28.8687 21.3987 29.0926 21.0478 29.0926Z" fill="white"/>
    </mask>
    <g mask="url(#mask0_65_1339)">
    <rect x="9.83984" y="11.0518" width="19.6811" height="19.6811" fill="white"/>
    </g>
    </g>
    <defs>
    <filter id="filter0_dd_65_1339" x="7.83984" y="10.0518" width="23.6807" height="23.6812" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="1"/>
    <feGaussianBlur stdDeviation="0.5"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_65_1339"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="1"/>
    <feGaussianBlur stdDeviation="1"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0"/>
    <feBlend mode="normal" in2="effect1_dropShadow_65_1339" result="effect2_dropShadow_65_1339"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_65_1339" result="shape"/>
    </filter>
    </defs>
    </svg>
  )
}