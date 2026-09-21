"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { TITLE_OVERRIDES } from "@/lib/music/titleOverrides";

const rawLinks: string[] = [
  "https://music.youtube.com/watch?v=i_a2LhIVhJk&si=b-OhpkriOruRV7u1",
  "https://music.youtube.com/watch?v=Pmwz7F8a8qk&si=FyVWJcr_TmTbZM0q",
  "https://music.youtube.com/watch?v=IFqMzjHBVRs&si=OHI8DyBgiSCL7E35",
  "https://music.youtube.com/watch?v=TzViBgxvMAg&si=Ayzf2tjXvhNWThdQ",
  "https://music.youtube.com/watch?v=Ez568iZk_GU&si=6GrStmSPzlzm7hsf",
  "https://music.youtube.com/watch?v=SPf4BKwQZlg&si=QIr-rlSguT_6ImKh",
  "https://music.youtube.com/watch?v=TY_jECDo0Xg&si=okX08KsL6mCoNunS",
  "https://music.youtube.com/watch?v=lXOn7hlGzbE&si=su2d4iiFCSdmygPg",
  "https://music.youtube.com/watch?v=vs9cTetQwng&si=w_UARPnt6GrJ0pQf",
  "https://music.youtube.com/watch?v=E14Y411myJU&si=YOVyOj-B7oRpa5D-",
  "https://music.youtube.com/watch?v=WSrC3FeBZA0&si=ZGUpWh7g8AoYk6oZ",
  "https://music.youtube.com/watch?v=rjJv6F52rZA&si=xzPes8mEATjioUUj",
  "https://music.youtube.com/watch?v=ukrJ6Y1nxpc&si=wHjwoQng8nntbcWw",
  "https://music.youtube.com/watch?v=6Axyuo1SMwE&si=MrFDx6o444K80o-E",
  "https://music.youtube.com/watch?v=9w9lFxqDOf4&si=Q12XzOzrrUEIXECi",
  "https://music.youtube.com/watch?v=_3TGBJ2F7OI&si=bj8uPseARJTx0q34",
  "https://music.youtube.com/watch?v=yA_zG8HQw1g&si=pl3W4D1EHoImsCjU",
  "https://music.youtube.com/watch?v=-O4-IfZqmSE&si=-iQDsXhBbJVqGPWw",
  "https://music.youtube.com/watch?v=A3xramklrRo&si=Lj_N1cNqEyyCxBZE",
  "https://music.youtube.com/watch?v=7CTr_uY-vaQ&si=7nwcx-J_GJ_Hcobx",
  "https://music.youtube.com/watch?v=0XzL4HMUxCc&si=YGh0GtrKT1U5STEd",
  "https://music.youtube.com/watch?v=ivxc1uS0zbA&si=tSH3kLgGrVqzhfsu",
  "https://music.youtube.com/watch?v=qm-YHSfA7Xs&si=gjOoRvQLmyIwb6Fv",
  "https://music.youtube.com/watch?v=6UBEDZfXX_U&si=51J9li216Tv3V8Er",
  "https://music.youtube.com/watch?v=OrmHbyKuowM&si=ltOGo9nDq2TzPzD0",
  "https://music.youtube.com/watch?v=QaPs1JjY6oU&si=65TqF1Iy1r5ml20R",
  "https://music.youtube.com/watch?v=YggUZ8f_oYQ&si=NnJXwp2JwEaccP_s",
  "https://music.youtube.com/watch?v=LVdNNNNIOHs&si=mTFt25dnNQ9Xk6ly",
  "https://music.youtube.com/watch?v=BAUCJuSuHpk&si=axcutxuf-B0MP8Tu",
  "https://music.youtube.com/watch?v=firJQs_hjBQ&si=GGoc4ld0xrIBwKGM",
  "https://music.youtube.com/watch?v=wTP9F9MCufs&si=uEbnb-pLbAhcyuW8",
  "https://music.youtube.com/watch?v=ykU7RdHOpl4&si=PCHs2KQpI8H6T68G",
  "https://music.youtube.com/watch?v=CpoKNX2wXD0&si=mRzBJwOKiN7VJ88K",
  "https://music.youtube.com/watch?v=4uiNhmS69iA&si=kaEVpaB3EYYv5eLu",
  "https://music.youtube.com/watch?v=krCGR5k8zpE&si=rA6k6ledDDe1Wwyh",
  "https://music.youtube.com/watch?v=GHEIlgSW7uo&si=rXnjt6bQLg24yDQq",
  "https://music.youtube.com/watch?v=BzjKgUTw5tI&si=NMbRjFDd-vizDAW0",
  "https://music.youtube.com/watch?v=VVU1ezTgMRc&si=tFr1-zmiGdzEIhtg",
  "https://music.youtube.com/watch?v=_x5laCnC4Vg&si=5czOerc4DNEqZ0J1",
  "https://music.youtube.com/watch?v=B_YTPqpqOYc&si=dDruKF-GhURks2v7",
  "https://music.youtube.com/watch?v=N4qP2XtCYas&si=WCwXHEMYpxqjGgw2",
  "https://music.youtube.com/watch?v=ThU01pz8v8g&si=QDN4Hnp7y_Podko6",
  "https://music.youtube.com/watch?v=sg34LtslhA4&si=i4vBqk0W9DmYfotO",
  "https://music.youtube.com/watch?v=rCv0xZ5Cn7I&si=kbDmLupMcycV2fI-",
  "https://music.youtube.com/watch?v=SRo-W8el9FU&si=Z-wizrbsrjCmmmAo",
  "https://music.youtube.com/watch?v=lBanpmIgnK4&si=bf9pM8dTfwsPGGGB",
  "https://music.youtube.com/watch?v=MVj-j5JJwDk&si=Uu9WjN3KaKJH5_Zo",
  "https://music.youtube.com/watch?v=iE4yVIbKSUY&si=wUm3EfGdq5S2xOcl",
  "https://music.youtube.com/watch?v=ji6j8K2Lhd4&si=jwJ5bbUxmNf3Ho76",
  "https://music.youtube.com/watch?v=G8ZzEErqwGw&si=XCMMQdGGywI2NahU",
  "https://music.youtube.com/watch?v=-slka9wInaw&si=KrjnTMbQ75cGF4JM",
  "https://music.youtube.com/watch?v=DbK3_pwq86w&si=oCVl8PdzVlGkmxjD",
  "https://music.youtube.com/watch?v=dF6b3LyXoOg&si=-_4ivpVBwShQnQao",
  "https://music.youtube.com/watch?v=L0dlCuGsjSc&si=LVGwLZj9W-X-39EX",
  "https://music.youtube.com/watch?v=aiiy2Yutx4I&si=tMIXNB7MUNyHPLqo",
  "https://music.youtube.com/watch?v=dQVE-yke4NA&si=zVjqPrPRRC3fp3Fs",
  "https://music.youtube.com/watch?v=qfazuJ7xRew&si=pYB4lwpa0xIhjwxz",
  "https://music.youtube.com/watch?v=Kkv8ikfcrgY&si=iThcsKd4PHuWm_uH",
  "https://music.youtube.com/watch?v=3XYRsHCMupw&si=8NgFLnuoFvSQVUQU",
  "https://music.youtube.com/watch?v=ckVk6XsMvaM&si=T5TcXrbS3wJkF1cu",
  "https://music.youtube.com/watch?v=1-n6AY97tjw&si=2_XW6h9k3LksNiUC",
  "https://music.youtube.com/watch?v=pAOti3oSezY&si=iQ3RrkPuL-QaugVG",
  "https://music.youtube.com/watch?v=udHppKefQuQ&si=rYhbDeTfAaWtR9tb",
  "https://music.youtube.com/watch?v=_Psjq25IQ04&si=FrN-poPjGyIqKmU4",
  "https://music.youtube.com/watch?v=liLaMpwp0bM&si=ExMZE3MzuGSKp6Tf",
  "https://music.youtube.com/watch?v=mBgRKeE9K4Q&si=BllPNnXyWjAmqzO2",
  "https://music.youtube.com/watch?v=NymoFtJtnLQ&si=s6Hjge1ACl7PyDr-",
  "https://music.youtube.com/watch?v=1cVVvWxZdI0&si=1Ou6ziE2X6ow5bdV",
  "https://music.youtube.com/watch?v=mdtO_DX9amg&si=UFuMne8pYZJ21KL8",
  "https://music.youtube.com/watch?v=7QH7UMPbTpY&si=aTx07VjPEHipfBkN",
  "https://music.youtube.com/watch?v=x2_3-u1miZI&si=XdJHZAIV2d0oieYy",
  "https://music.youtube.com/watch?v=PurIQoyUR5w&si=K0RNb_mMWZhqshI_",
  "https://music.youtube.com/watch?v=Hf0GEryXnVQ&si=pnIS44qCx39TVDu7",
  "https://music.youtube.com/watch?v=R6lHg4UlN6c&si=nwA4OugexJ_Evv5e",
  "https://music.youtube.com/watch?v=onDlI9ZZqF0&si=kDwrL-Ooqg7NbHys",
  "https://music.youtube.com/watch?v=ToirqdI76bE&si=Oy7rYzZ03dyeqfxh",
  "https://music.youtube.com/watch?v=dgE9UVwDsZg&si=n2VVAP7aNAaZsYxc",
  "https://music.youtube.com/watch?v=9f9TJuO0JH8&si=0ZTutt7bkGzPgidK",
  "https://music.youtube.com/watch?v=wi0MZFUhdXQ&si=-bIZAS0JIvf0524p",
  "https://music.youtube.com/watch?v=1K1QqDG_ZnI&si=ICgmnf6qudrL6k52",
  "https://music.youtube.com/watch?v=r2AeE5N0HRo&si=NZLPhuorsRtSmZcE",
  "https://music.youtube.com/watch?v=7mx-8_nHn00&si=Y56YGVPI-io4A9Ov",
  "https://music.youtube.com/watch?v=HanrhcHOc4o&si=TMNOLPn5fDVJnJvH",
  "https://music.youtube.com/watch?v=51bUPC2kusI&si=dtg2OXyCJkZu-Gk1",
  "https://music.youtube.com/watch?v=kxhgQdQsuc0&si=l8x-GrRh1Li3j3IA",
  "https://music.youtube.com/watch?v=VoOPOLox1I8&si=0MsnCzF_RdtchNAm",
  "https://music.youtube.com/watch?v=exUSSI5p75g&si=UDinkBYajje4s4ZG",
  "https://music.youtube.com/watch?v=H8a_5ZN4HWU&si=6L3w_YLmGv6_-QmE",
  "https://music.youtube.com/watch?v=H8a_5ZN4HWU&si=U6u43GulT4NnXX2Y",
  "https://music.youtube.com/watch?v=LsOFLJBuCrM&si=QLNo1daJc2BINfT2",
  "https://music.youtube.com/watch?v=7I7oftngygY&si=1-QO2A_YEwTTMzmi",
  "https://music.youtube.com/watch?v=coksu8dlAOw&si=31fAKRtwzT35SARb",
  "https://music.youtube.com/watch?v=OoewZXrG8X4&si=0eKxK9yFXtqNV7kE",
  "https://music.youtube.com/watch?v=NSAkRakeujw&si=AJoRUeewy5SK_7Dx",
  "https://music.youtube.com/watch?v=LHucfPiv8m4&si=64lgk7F-t_1G_7Z6",
  "https://music.youtube.com/watch?v=x4ExP8k9QbE&si=4TN-6YsSBzG3uXTv",
  "https://music.youtube.com/watch?v=SCgQOAS63eM&si=YDZpr8vnqqOP3Ccy",
  "https://music.youtube.com/watch?v=HhRYtXBpvHk&si=i2JnVVl5Pff1kuGo",
  "https://music.youtube.com/watch?v=HhRYtXBpvHk&si=uI-G_uz6XukQm5A3",
  "https://music.youtube.com/watch?v=kIWeVStGx9Q&si=TK3poh9PoOFshpdf",
  "https://music.youtube.com/watch?v=2nUEcnVILH4&si=Td0_kpYSTIec4Us-",
  "https://music.youtube.com/watch?v=tFbs4gaU610&si=PoBR9KkdN7Xps6Rv",
  "https://music.youtube.com/watch?v=TdH1hBBtI9o&si=zd8AgCphSYOkBjFw",
  "https://music.youtube.com/watch?v=buh-AmQ7zVM&si=X_9I4ofm_9TDS7oW",
  "https://music.youtube.com/watch?v=EROmPfEnTHY&si=T_aokXLFIf-kBP8n",
  "https://music.youtube.com/watch?v=cnMZveybkHs&si=F1ksdL-1GSR_rapf",
  "https://music.youtube.com/watch?v=JmT-Cw1O20U&si=evRbPYADli6v9D72",
  "https://music.youtube.com/watch?v=pMqZ-pVXpEE&si=jVR1GjVtWMfQ7pAk",
  "https://music.youtube.com/watch?v=VlG52jawd_0&si=IGho3z7_bcGygWks",
  "https://music.youtube.com/watch?v=2RaM46979ZI&si=mg1Z5v7dCOnF8IyK",
  "https://music.youtube.com/watch?v=IvDMfoXH5Wo&si=7nx2Ae0-ppi4cUFM",
  "https://music.youtube.com/watch?v=E2pyao8HkNU&si=wu3pQ6bykI-AT1Im",
  "https://music.youtube.com/watch?v=wczdLvpWXvI&si=hrtfnhKSJnBLpqVF",
  "https://music.youtube.com/watch?v=FKwrr3-XbCA&si=fq3vcTGSeH33U0x6",
  "https://music.youtube.com/watch?v=KHzDxuisLnE&si=VHB7z9Hv7xflsnJP",
  "https://music.youtube.com/watch?v=TAaFr6cP7Sc&si=S2yAjSL3n9EBrA6d",
  "https://music.youtube.com/watch?v=ycA-aKfP3GA&si=hHvBSMaNvlu8D_rn",
  "https://music.youtube.com/watch?v=AkyNqboQ2uo&si=uw4daCbvsCe3heTG",
  "https://music.youtube.com/watch?v=gN3PzeYCKfo&si=cIdbaP1Q0TbVDG5I",
  "https://music.youtube.com/watch?v=7dFI42Qh75o&si=DRkEe610S-sr_uXY",
  "https://music.youtube.com/watch?v=11ynKXi9dWM&si=oxfYWvmZ7SKjTXul",
  "https://music.youtube.com/watch?v=vnnwnhSpthw&si=1AdOVFAkePoeuzX6",
  "https://music.youtube.com/watch?v=Kw4mASeH5i0&si=-1NuYc323P2jhoOU",
  "https://music.youtube.com/watch?v=Jx5V8UQq1EI&si=lMIV4hoN12yFEiq1",
  "https://music.youtube.com/watch?v=SG7egfRRLKc&si=tzGjGNZN_GG49mgW",
  "https://music.youtube.com/watch?v=RnfEBvhUWok&si=9pcmOhOdhre5I6Cm",
  "https://music.youtube.com/watch?v=T1PK3WhhR-4&si=H4Yl6twTgKmTVki0",
  "https://music.youtube.com/watch?v=n75yLLPJhZo&si=Or9qUA_tOOr9n5JR",
  "https://music.youtube.com/watch?v=W3y1QLTM2bY&si=9bsao6He_G6ZzVoX",
  "https://music.youtube.com/watch?v=wNPwSJ3-jFQ&si=JvB5XhqQqadtZdqj",
  "https://music.youtube.com/watch?v=8ScfA7i8j4U&si=qOwBYf84aC6XHuYS",
  "https://music.youtube.com/watch?v=J7MpYQmpK3c&si=p7m73v8jm7gIWN2c",
  "https://music.youtube.com/watch?v=dZH655GQHEE&si=6lJjTP33pqQLGPFw",
  "https://music.youtube.com/watch?v=-J7Qhg5OlWM&si=KZDTnBIndXRBMXc5",
  "https://music.youtube.com/watch?v=OGxI4RoAoVI&si=aFkWq6a7spxWj9Oi",
  "https://music.youtube.com/watch?v=7HSriHabGc8&si=kgrg2iKRncQhc7vo",
  "https://music.youtube.com/watch?v=o77DAJue9iw&si=MOcyZhVqrGVzF1wX",
  "https://music.youtube.com/watch?v=MU-ODLhs6cg&si=W8q1-KGp0Q7Y7f-a",
  "https://music.youtube.com/watch?v=qXTSVpV-EVM&si=M3kMqsQ7G3Q9SAqh",
  "https://music.youtube.com/watch?v=e4ddfz3Z1kE&si=uWePAnr-kKPBrf9X",
  "https://music.youtube.com/watch?v=5ppq-uCEilo&si=Epo_Emcj-jYmrvgf",
  "https://music.youtube.com/watch?v=Un7_YctMfRM&si=0G3ol6Fy_djf84hw",
  "https://music.youtube.com/watch?v=wBRoNbzvJ-g&si=mz6KILGPfW8TfCGi",
  "https://music.youtube.com/watch?v=5hR_NJ90o4o&si=MRfr5I5mm0h885-5",
  "https://music.youtube.com/watch?v=rxzVr8Jk83I&si=5rrpCmchvsuAS8c_",
  "https://music.youtube.com/watch?v=IeKURctt3vU&si=NuPvuFaFFVFaRUQE",
  "https://music.youtube.com/watch?v=PzpPKgnvXuY&si=TCdyi6x1VBcM-uWn",
  "https://music.youtube.com/watch?v=TuLNWIFasUw&si=Lx7g6SygAzJDxzUG",
  "https://music.youtube.com/watch?v=PUqhLXedAFc&si=zWAvGzdxdodBpqw6",
  "https://music.youtube.com/watch?v=vGf9LrmzSc8&si=IuxDQl6c_iCQTl9f",
  "https://music.youtube.com/watch?v=MSMnoQwAwfI&si=SQKXSJTGcJVZxofN",
  "https://music.youtube.com/watch?v=pgyA1h0D2Mc&si=_iVL_HBp4KH8R5M_",
  "https://music.youtube.com/watch?v=TOXV11t27Ro&si=mWo6oRJx3pTTR5Sn",
  "https://music.youtube.com/watch?v=PEvtC-HL4Bk&si=mldtK0U7qffzlB5G",
  "https://music.youtube.com/watch?v=RRhwfbvc5R8&si=8WnSb7HXtfJAj-ie",
  "https://music.youtube.com/watch?v=gUULZoEMBos&si=0tr4z4FiGje01bxx",
  "https://music.youtube.com/watch?v=1uUTb4ooluc&si=C4pvvCjfhanxvOib",
  "https://music.youtube.com/watch?v=tz1bAqyf8Mc&si=PUiEkPazWBwH_8r3",
  "https://music.youtube.com/watch?v=au8JoT2Fq1w&si=kQ0lFtcZKlPnQ0DW",
  "https://music.youtube.com/watch?v=tz_gv3juYgY&si=YAfApQ0Pq4G0CjLQ",
  "https://music.youtube.com/watch?v=9fo8k5-EkkA&si=BCI_oOMJtKrYXkCR",
  "https://music.youtube.com/watch?v=zXW2hmfLWZY&si=77kRYjf1Gu2x9PJK",
  "https://music.youtube.com/watch?v=Byej4XA35dE&si=mAQQBLOlvFYnY0zo",
  "https://music.youtube.com/watch?v=r5rx7X_Ks-I&si=xT2l8Yj5vn8wwZ-J",
  "https://music.youtube.com/watch?v=2nPHMXAs8Dk&si=1i3cDfYEfWtO9ESp",
  "https://music.youtube.com/watch?v=aiiy2Yutx4I&si=tMIXNB7MUNyHPLqo",
  "https://music.youtube.com/watch?v=ji6j8K2Lhd4&si=dj6UDkeVeZWWigDb",
  "https://music.youtube.com/watch?v=fClzw0x4WQQ&si=EGXALCLhqppbNbmf",
  "https://music.youtube.com/watch?v=Hf0GEryXnVQ&si=9hhKpqUFe9E2k-k3",
  "https://music.youtube.com/watch?v=DKI9BlBTa7E&si=iWHeipfymlMSvTj-",
  "https://music.youtube.com/watch?v=cLACFB98IMk&si=qBkyco-W1K82SKsk",
  "https://music.youtube.com/watch?v=EGkesqaw2rE&si=9vsv61DQ6PcJgcEm",
  "https://music.youtube.com/watch?v=MXAzXkOgrV8&si=pDok-24L2A5YOxW7",
  "https://music.youtube.com/watch?v=MXAzXkOgrV8&si=aMWYLocMes2HKPkV",
  "https://music.youtube.com/watch?v=nsR3m5U_d4w&si=NsbkhW4BF_m9WM0k",
  "https://music.youtube.com/watch?v=V_b79pR_NIw&si=_9LwkuKuptyb2zDU",
  "https://music.youtube.com/watch?v=Kb-2OMQkq84&si=3kuzCfFVDrBlEyBb",
  "https://music.youtube.com/watch?v=mej_M2Zbads&si=rf222UNweK0K3fdJ",
  "https://music.youtube.com/watch?v=SfkGri-7488&si=t1IP9QXCupsKbG4w",
  "https://music.youtube.com/watch?v=wwuWgc-L4Do&si=IAli5XglEVAVPsq1",
  "https://music.youtube.com/watch?v=B3tS2vg-LsU&si=cJSVWbL0BMeFCfDc",
  "https://music.youtube.com/watch?v=lGczKSu4Bzo&si=zeVmCH_uP2IIDkLc",
  "https://music.youtube.com/watch?v=LT53JzLjLUY&si=xysfJssmseeIVUjd",
  "https://music.youtube.com/watch?v=tWNq2NLghbA&si=oLomlE1IYxHe4YdG",
  "https://music.youtube.com/watch?v=VsN9k_kTFqc&si=x5WmdAo7X7-uWH70",
  "https://music.youtube.com/watch?v=B3tS2vg-LsU&si=D2KIc2_vKx4Xk6hk",
  "https://music.youtube.com/watch?v=y8TkxlKyQzo&si=WHVTU-Joezd6wTA4",
  "https://music.youtube.com/watch?v=2nUEcnVILH4&si=kQklkSyzxpZgBbR5",
  "https://music.youtube.com/watch?v=0fCDLrS0DYc&si=vK4ouZaPgkAFyoz_",
  "https://music.youtube.com/watch?v=q8JpqO04rSg&si=SPYMT0zJ6JRrmrph",
  "https://music.youtube.com/watch?v=q8JpqO04rSg&si=QcelC_ASfSQDWTGq",
  "https://music.youtube.com/watch?v=1Cs6cGCOzt0&si=UfuXku5KDlwJ_FmO",
  "https://music.youtube.com/watch?v=yFd_9WhNIqM&si=qzfZdtVW5i9dKuxO",
  "https://music.youtube.com/watch?v=gVJgFrKfpjs&si=EDi9YZ814ABtHIm7",
  "https://music.youtube.com/watch?v=YXpwTL3Y_R0&si=FvUxMOinGmQPWuZW",
  "https://music.youtube.com/watch?v=eenQieum648&si=82Pkjp9W1d75eM9g",
  "https://music.youtube.com/watch?v=cSq7fNwUrjQ&si=Wa0ZYCN0nXmn9S2q",
  "https://music.youtube.com/watch?v=zAs3Xigji3g&si=HFrxFIejyDCzUJtP",
  "https://music.youtube.com/watch?v=qvFmiVfWkmM&si=sQ2mrE9upGm8zWtF",
  "https://music.youtube.com/watch?v=7l4NNAtPEtM&si=0xTpXco62hhTzcgV",
  "https://music.youtube.com/watch?v=M4nKtIMCQrg&si=YUyAYaI2o3L3gmlX",
  "https://music.youtube.com/watch?v=B6kteTosqUI&si=lxGXEzS-Mf37yGEC",
  "https://music.youtube.com/watch?v=Wav2qqUiFwE&si=YdytiO68Mt_ZcADt",
  "https://music.youtube.com/watch?v=cbl843gqd90&si=3-Qeswl5YRn_z6l1",
  "https://music.youtube.com/watch?v=CU28iNfrWMI&si=Dzgy9m_YqgEDI_aa",
  "https://music.youtube.com/watch?v=rOKAXXSflYc&si=2wMtGm_fmeXPsvBk",
  "https://music.youtube.com/watch?v=kHCWI1yxoNk&si=4pV77BJ-YpO8cfQW",
  "https://music.youtube.com/watch?v=jRC2VIcTVq0&si=W5TFqOByXgHwXCCB",
  "https://music.youtube.com/watch?v=5Gi_NnhQb1Y&si=gN31R1LjO76HFU4S",
  "https://music.youtube.com/watch?v=DSej8Q7hmog&si=QrrUqcd2SuoP-Xpt",
  "https://music.youtube.com/watch?v=AW3-7DU0JVs&si=3awWhk4qpbWtjSN5",
  "https://music.youtube.com/watch?v=UcDvWuUNaD8&si=UIPwJCQH93bRTjwA",
  "https://music.youtube.com/watch?v=EPNux6OcmnE&si=6kcmMG9isMdhQ2FN",
  "https://music.youtube.com/watch?v=fbp-aKndpoc&si=qysRUCch5YrZcwrP",
  "https://music.youtube.com/watch?v=-5zEyXS08pk&si=jgdnYHEDzasOpnTa",
  "https://music.youtube.com/watch?v=_Do3duXxxbs&si=NQBdC_Fd9d9EFT67",
  "https://music.youtube.com/watch?v=r00GxyY79S4&si=v8SAzf7GVzuTD4W7",
  "https://music.youtube.com/watch?v=iMCqBagOOOs&si=fG2xU0CYzbZmdZuq",
  "https://music.youtube.com/watch?v=ujGTENMJfLw&si=eoUQb1oIpQoe1O0W",
  "https://music.youtube.com/watch?v=djcK3n3-AKo&si=ROMMc5ZxjKcqPdfe",
  "https://music.youtube.com/watch?v=wQh5fZhC_C8&si=x4VYnR1ph_So7ePf",
  "https://music.youtube.com/watch?v=JQDHYozbpew&si=Hg66hQ52PPdg0Jec",
  "https://music.youtube.com/watch?v=dtnKrbdOmfs&si=vQNttI9gmtFY8tx3",
  "https://music.youtube.com/watch?v=TTWtOaIaXcs&si=-iOkoJ3PeOCv2qFI",
];

type Kind = "all" | "project";

type Item = {
  key: string;
  kind: Kind;
  id: string;
  url: string; // normalized to music.youtube.com/watch?v=ID
  embed: string; // youtube embed for web player
  thumb: string;
  title?: string;
  releaseDate?: string;
};

function buildItems(links: string[]): Item[] {
  const seen = new Set<string>();
  const items: Item[] = [];
  for (const raw of links) {
    if (!raw) continue;
    const urlMatch = raw.match(/https?:\/\/[^\s]+/);
    let url = (urlMatch ? urlMatch[0] : raw).trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    url = url.replace(/^https:\/\/ic\.youtube\.com/i, "https://music.youtube.com");
    let u: URL;
    try {
      u = new URL(url);
    } catch {
      continue;
    }
    // Extract video ID and clean URL
    const hostLower = u.hostname.toLowerCase();
    if (hostLower.includes("youtube.com") || hostLower.includes("youtu.be")) {
      // Normalize to music.youtube.com
      u.hostname = "music.youtube.com";
    }

    // accept youtube.com, youtu.be, music.youtube.com
    const hostOk =
      /(youtube\.com|music\.youtube\.com|youtu\.be)$/i.test(u.hostname);
    if (!hostOk) continue;

    // extract video or playlist id
    let videoId = "";
    if (u.hostname === "youtu.be") {
      videoId = u.pathname.slice(1);
    } else if (u.pathname === "/watch") {
      videoId = u.searchParams.get("v") ?? "";
    }
    const listId = u.searchParams.get("list") ?? "";

    if (videoId) {
      const key = `video:${videoId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // normalize outbound URL to music.youtube.com
      const musicUrl = new URL("https://music.youtube.com/watch");
      musicUrl.searchParams.set("v", videoId);
      const si = u.searchParams.get("si");
      if (si) musicUrl.searchParams.set("si", si);
      items.push({
        key,
        kind: "all",
        id: videoId,
        url: musicUrl.toString(),
        // use standard embed for the web player (Music cannot be embedded)
        embed: `https://www.youtube-nocookie.com/embed/${videoId}`,
        thumb: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      });
      continue;
    }

    if (listId) {
      const key = `playlist:${listId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // normalize outbound URL to music.youtube.com playlist
      const musicList = new URL("https://music.youtube.com/playlist");
      musicList.searchParams.set("list", listId);

      items.push({
        key,
        kind: "project",
        id: listId,
        url: musicList.toString(),
        // playlists still use youtube embed to play inside the site
        embed: `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}`,
        thumb: "https://i.ytimg.com/img/no_thumbnail.jpg",
      });
    }
  }
  return items;
}

async function fetchTitle(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    if (!res.ok) return;
    const data = (await res.json()) as { title?: string };
    return data.title;
  } catch {
    return;
  }
}

async function fetchTitleFromVideoId(videoId: string): Promise<string | undefined> {
  try {
    const yt = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(yt)}`);
    if (!res.ok) return;
    const data = (await res.json()) as { title?: string };
    return data.title;
  } catch {
    return;
  }
}

const FALLBACK_TITLE = "1TakeQuan Track"; // shown only when a title genuinely can't be resolved

// Resolved titles are cached so returning visitors get the sorted catalog immediately.
const TITLE_CACHE_KEY = "1takequan_music_titles_v1";

// Sort key for the A–Z catalog. Only used for ordering — the visible title is never altered.
// Drops a leading "1TakeQuan -" style artist prefix (hyphen, en/em dash, colon or pipe), a
// "1TakeQuan x/ft Name -" collab prefix, and any leading punctuation/quotes/emoji, so those don't
// pile up under "1" or symbols.
function sortKey(title: string) {
  return title
    .trim()
    .replace(/^1\s*take\s*quan\s*[-–—:|]\s*/i, "")
    // "1TakeQuan x Name - Song" / "1TakeQuan ft Name - Song": drop the collab credit, keep the song
    .replace(/^1\s*take\s*quan\s+(?:x|ft\.?|feat\.?|featuring|&|and|with)\s+[^-–—:|]+?\s*[-–—:|]\s*/i, "")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .toLowerCase();
}

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const FEATURED_ID = ""; // set a key from your catalog (e.g., "video:XXXXX")

const WIDE = "mx-auto w-full max-w-[1500px] px-6 sm:px-8 lg:px-12";

// Editorial discovery cards. Imagery is existing site photography from /public/gallery.
// Not wired to catalog data — no track assignments are implied.
const DISCOVERY = [
  { title: "For New Fans", desc: "Start here — the essentials.", img: "/gallery/4.jpeg", pos: "object-[50%_30%]" },
  { title: "Turn-Up Quan", desc: "High energy, stage-ready.", img: "/gallery/33.jpg", pos: "object-center" },
  { title: "Pain / Late Night", desc: "Reflective, raw, 2AM vibe.", img: "/gallery/1.jpeg", pos: "object-[50%_30%]" },
  { title: "Underrated", desc: "Sleeper picks the day-ones know.", img: "/gallery/39.JPG", pos: "object-center" },
];

// Split a raw YouTube title into song / credit / content type so the hero can
// give each its own weight. Falls back gracefully when a title doesn't match.
function splitTitle(raw: string): { song: string; credit: string; type?: string } {
  let t = raw.trim();
  let type: string | undefined;
  let feature: string | undefined;
  t = t.replace(/[(\[]\s*([^)\]]*?)\s*[)\]]/g, (m, inner: string) => {
    if (!type && /official|video|audio|visualizer|lyric|performance/i.test(inner) && !/^(ft|feat)/i.test(inner)) {
      type = inner;
      return "";
    }
    const f = inner.match(/^(?:ft\.?|feat\.?|featuring)\s+(.+)$/i);
    if (f && !feature) {
      feature = f[1];
      return "";
    }
    return m;
  });
  t = t.replace(/^1TakeQuan\s*[-–—:]\s*/i, "").replace(/\s+/g, " ").trim();
  const split = t.match(/^(.*?)\s+(?:ft\.?|feat\.?|featuring)\s+(.+)$/i);
  if (split) {
    t = split[1].trim();
    feature = feature ?? split[2].trim();
  }
  return { song: t || raw, credit: feature ? `1TakeQuan ft. ${feature}` : "1TakeQuan", type };
}

// Featured artwork with a branded placeholder underneath, so the first paint is
// never an empty black box. Tries the high-res thumbnail, falls back to hqdefault.
function HeroVisual({ id, fallbackThumb, onPlay }: { id?: string; fallbackThumb?: string; onPlay: () => void }) {
  const [src, setSrc] = useState(id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : fallbackThumb);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative">
      <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl border border-red-500/40" />
      <button
        type="button"
        onClick={onPlay}
        aria-label="Play featured release"
        className="group relative block aspect-video w-full overflow-hidden rounded-xl border border-zinc-700/70 bg-zinc-950 shadow-2xl shadow-red-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900 via-zinc-950 to-red-950/50 pb-28">
          <Image src="/logo.PNG" alt="" width={64} height={64} className={`h-16 w-16 object-contain opacity-80 ${loaded ? "" : "animate-pulse"}`} />
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-500">1TakeQuan</span>
        </div>
        {src && (
          <Image
            src={src}
            alt="Featured release artwork"
            fill
            unoptimized
            priority
            sizes="(max-width: 1024px) 100vw, 700px"
            className={`scale-[1.2] object-cover transition-all duration-700 group-hover:scale-[1.25] ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={(e) => {
              if (e.currentTarget.naturalWidth <= 120 && fallbackThumb && src !== fallbackThumb) setSrc(fallbackThumb);
              else setLoaded(true);
            }}
            onError={() => {
              if (fallbackThumb && src !== fallbackThumb) setSrc(fallbackThumb);
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/90 text-white shadow-xl transition-transform group-hover:scale-110">
            <svg className="ml-1 h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </button>
    </div>
  );
}

// Compact rectangular track card: artwork first, title second, play affordance third.
// No raw IDs, no filler metadata — just enough to browse and tap.
function TrackCard({ title, thumb, onSelect }: { title: string; thumb: string; onSelect: () => void }) {
  const [broken, setBroken] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group text-left rounded-md border border-zinc-800/80 bg-zinc-900/60 overflow-hidden transition-colors hover:border-red-500/50 hover:bg-zinc-900 focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
    >
      <div className="relative aspect-square bg-zinc-800">
        {!broken ? (
          <Image
            src={thumb}
            alt={title}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 300px"
            onError={() => setBroken(true)}
            onLoad={(e) => {
              // YouTube serves a tiny grey placeholder (no error) when a thumbnail is missing.
              if (e.currentTarget.naturalWidth <= 120) setBroken(true);
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <svg className="h-6 w-6 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
        <div className="absolute bottom-1.5 right-1.5 lg:bottom-2.5 lg:right-2.5 flex h-6 w-6 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-90 shadow-md transition-transform group-hover:scale-110 group-hover:opacity-100">
          <svg className="ml-0.5 h-3 w-3 lg:h-4 lg:w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="flex h-[2.6rem] items-start px-2 py-2 sm:h-[2.9rem] lg:h-[3.4rem] lg:px-3">
        <p className="line-clamp-2 break-words text-[11px] font-medium leading-tight text-gray-100 sm:text-xs lg:text-sm">
          {title}
        </p>
      </div>
    </button>
  );
}

export default function MusicPage() {
  const items = useMemo(() => buildItems(rawLinks), []);
  const { playlist, setPlaylist, currentTrack, isPlaying, pause } = usePlayer();
  const [meta, setMeta] = useState<Record<string, string>>({});
  const [modalItem, setModalItem] = useState<Item | null>(null);
  const [query, setQuery] = useState("");
  const [titleWaited, setTitleWaited] = useState(false);
  const [metaDone, setMetaDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTitleWaited(true), 6000);
    return () => clearTimeout(t);
  }, []);

  // Title lookup. Cached titles are used straight away; only missing ones hit noembed.
  // `metaDone` flips once every lookup (including the retry pass) has finished — the catalog is
  // shown A–Z only then, so cards never reshuffle while titles are still streaming in.
  useEffect(() => {
    let cancelled = false;
    const BATCH = 18;
    const DELAY_MS = 250; // throttle to avoid rate limits

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const all: Record<string, string> = {};
    try {
      const cached = JSON.parse(localStorage.getItem(TITLE_CACHE_KEY) || "{}") as Record<string, string>;
      for (const it of items) if (typeof cached[it.key] === "string" && cached[it.key]) all[it.key] = cached[it.key];
    } catch {}
    if (Object.keys(all).length > 0) setMeta({ ...all });

    (async () => {
      const todo = items.filter((it) => !all[it.key]);

      for (let i = 0; i < todo.length; i += BATCH) {
        const pairs = await Promise.all(
          todo.slice(i, i + BATCH).map(async (it) => {
            const title = await fetchTitleFromVideoId(it.id);
            return title ? ([it.key, title] as const) : null;
          })
        );

        if (cancelled) return;

        for (const p of pairs) if (p) all[p[0]] = p[1];
        setMeta({ ...all });

        if (i + BATCH < todo.length) await sleep(DELAY_MS);
      }

      // A batch can hit a transient noembed failure; retry those titles once, one at a time.
      // Videos with a known permanent noembed failure (TITLE_OVERRIDES) are skipped.
      for (const it of items) {
        if (all[it.key] || TITLE_OVERRIDES[it.id]) continue;
        await sleep(DELAY_MS);
        const title = await fetchTitleFromVideoId(it.id);
        if (cancelled) return;
        if (title) {
          all[it.key] = title;
          setMeta({ ...all });
        }
      }

      if (cancelled) return;
      try {
        localStorage.setItem(TITLE_CACHE_KEY, JSON.stringify(all));
      } catch {}
      setMetaDone(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [items]);

  // Display title: the resolved noembed title, else a known override, else the placeholder.
  const titleFor = (it: Item) => meta[it.key] ?? meta[it.id] ?? TITLE_OVERRIDES[it.id] ?? it.title ?? FALLBACK_TITLE;

  const toTrack = (it: Item) => ({
    id: it.id,
    title: titleFor(it), // never show raw IDs
    cover: it.thumb,
    artists: ["1TakeQuan"],
    sources: { youtube: it.url },
  });

  // The final A–Z order. Only established once every title is resolved; until then the catalog
  // shows a loading state instead of a list that would keep reordering.
  const sortedItems = useMemo(() => {
    if (!metaDone) return items;
    const withKey = items.map((it) => {
      const title = meta[it.key] ?? meta[it.id] ?? TITLE_OVERRIDES[it.id] ?? it.title ?? FALLBACK_TITLE;
      return { it, title, key: sortKey(title) };
    });
    withKey.sort((x, y) => collator.compare(x.key, y.key) || collator.compare(x.title, y.title) || (x.it.id < y.it.id ? -1 : 1));
    return withKey.map((w) => w.it);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, meta, metaDone]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tracks = useMemo(() => items.map(toTrack), [items, meta]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sortedTracks = useMemo(() => sortedItems.map(toTrack), [sortedItems, meta]);

  // Seed the global player once. If the player already has a playlist (e.g. the visitor
  // navigated away and back), leave it alone so the current track isn't reset.
  useEffect(() => {
    if (playlist.length > 0 || tracks.length === 0) return;
    setPlaylist(tracks, 0);
  }, [playlist.length, tracks, setPlaylist]);

  // Keep the global playlist in step with the page:
  //  - while titles stream in: fill in resolved titles, keeping the existing order;
  //  - once done: switch to the same A–Z order as the grid, so Next/Previous follow what the fan sees.
  // While a song is playing its track object is kept as-is — handing the player a new object for
  // the same song makes it reload the video (restarting the song).
  useEffect(() => {
    if (playlist.length === 0) return;

    const fresh = new Map(tracks.map((t) => [t.id, t]));
    const base = metaDone
      ? sortedTracks
      : playlist.map((t) => {
          const f = fresh.get(t.id);
          return f && f.title !== FALLBACK_TITLE ? f : t;
        });
    const next = isPlaying && currentTrack ? base.map((t) => (t.id === currentTrack.id ? currentTrack : t)) : base;

    const sig = (list: { id: string; title: string }[]) => list.map((t) => `${t.id}\t${t.title}`).join("\n");
    if (sig(next) === sig(playlist)) return;

    const idx = currentTrack ? next.findIndex((t) => t.id === currentTrack.id) : 0;
    setPlaylist(next, idx >= 0 ? idx : 0);
  }, [tracks, sortedTracks, metaDone, playlist, currentTrack, isPlaying, setPlaylist]);

  // Opening a track in the modal also points the global player at it (paused, so only the modal
  // plays) — the player then shows the same resolved title, and Next/Previous continue from here.
  const selectTrack = (it: Item) => {
    setModalItem(it);
    pause();
    const idx = playlist.findIndex((t) => t.id === it.id);
    if (idx >= 0) setPlaylist(playlist, idx);
  };

  const featured = items.find((it) => it.key === FEATURED_ID) ?? items[0];
  const heroTitle = meta[featured?.key ?? ""];
  const heroParts = heroTitle ? splitTitle(heroTitle) : null;

  // Only "search across all tracks" is truthful with this data — the old
  // Singles / Projects / Videos / Popular tabs never matched real categories
  // (Popular was literally randomized), so they've been removed rather than
  // left in place lying to fans about what they filter.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedItems;
    return sortedItems.filter((it) => {
      const title = meta[it.key] ?? meta[it.id] ?? TITLE_OVERRIDES[it.id] ?? it.title ?? "";
      return title.toLowerCase().includes(q);
    });
  }, [sortedItems, meta, query]);

  return (
    <main className="-mx-2 -mt-20 min-h-screen pb-16 pt-20 text-white sm:-mx-4 md:-mx-6">
      {/* Local, presentational fix for white nav links disappearing over bright
          hero imagery. Sits below the fixed nav (z-50) and above hero content. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-28 bg-gradient-to-b from-black/80 via-black/35 to-transparent" />
      {/* HERO — featured release */}
      <section className="relative isolate overflow-hidden border-b border-zinc-900 bg-black">
        <Image
          src="/gallery/28.JPG"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[50%_25%] opacity-50"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/75 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-black to-transparent" />
        <div className={`${WIDE} grid items-center gap-12 pb-16 pt-32 lg:min-h-[640px] lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-36`}>
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
              <span className="h-px w-10 bg-red-500" />
              Featured Release
            </p>
            {heroParts ? (
              <>
                <h1 className="mt-5 break-words text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl xl:text-7xl">
                  {heroParts.song}
                </h1>
                <p className="mt-4 text-xl font-semibold text-gray-100 sm:text-2xl">{heroParts.credit}</p>
                {heroParts.type && (
                  <p className="mt-3 inline-block rounded-sm border border-red-500/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-red-300">
                    {heroParts.type}
                  </p>
                )}
              </>
            ) : titleWaited ? (
              <h1 className="mt-5 text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl xl:text-7xl">
                New Music
              </h1>
            ) : (
              <div aria-hidden className="mt-5 space-y-3">
                <div className="h-14 w-4/5 animate-pulse rounded bg-zinc-800/80" />
                <div className="h-14 w-3/5 animate-pulse rounded bg-zinc-800/80" />
                <div className="mt-5 h-6 w-2/5 animate-pulse rounded bg-zinc-800/60" />
              </div>
            )}
            <p className="mt-8 max-w-md border-l-2 border-red-500 pl-4 text-lg italic text-gray-300">
              &quot;The Great Quan — not a tape, a statement.&quot;
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => featured && selectTrack(featured)}
                className="rounded-full bg-red-500 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-400"
              >
                ▶ Play
              </button>
              <a
                href={featured?.url ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-zinc-600 px-7 py-3 text-sm transition-colors hover:border-red-400 hover:text-red-300"
              >
                Watch Video ↗
              </a>
            </div>
          </div>
          <HeroVisual id={featured?.id} fallbackThumb={featured?.thumb} onPlay={() => featured && selectTrack(featured)} />
        </div>
      </section>

      {/* CURATED DISCOVERY — editorial cards; not wired to catalog data yet */}
      <section className={`${WIDE} pt-16 sm:pt-20`}>
        <div className="mb-8 max-w-xl">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
            <span className="h-px w-10 bg-red-500" />
            Discover
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">Find your way in</h2>
          <p className="mt-2 text-gray-400">Four ways into the world of 1TakeQuan.</p>
        </div>
        <ul aria-label="Curated discovery" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {DISCOVERY.map((c, i) => (
            <li key={c.title} className="relative aspect-[5/4] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 sm:aspect-[4/5]">
              <Image
                src={c.img}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={`object-cover ${c.pos}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
              <span className="absolute left-4 top-4 text-sm font-bold tabular-nums tracking-widest text-red-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-2xl font-black uppercase leading-none tracking-tight">{c.title}</h3>
                <p className="mt-2 text-sm text-gray-300">{c.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${WIDE} mt-20 sm:mt-24`}>
        <div aria-hidden className="mb-14 h-px bg-zinc-800/70" />
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
              <span className="h-px w-10 bg-red-500" />
              All Music
            </p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">
              {metaDone ? filtered.length : items.length}
              {metaDone && query ? ` of ${items.length}` : ""} Tracks
            </h2>
          </div>
          <div className="relative w-full sm:w-72">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tracks..."
              className="w-full rounded-full border border-zinc-700 bg-zinc-900 py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        {!metaDone ? (
          <div aria-busy="true" aria-label="Loading tracks" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-md border border-zinc-800/80 bg-zinc-900/60">
                <div className="aspect-square bg-zinc-800/70" />
                <div className="h-[2.6rem] px-2 py-2 sm:h-[2.9rem] lg:h-[3.4rem] lg:px-3">
                  <div className="h-3 w-3/4 rounded bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border border-zinc-800 bg-zinc-900/40 py-16 text-center text-gray-400">
            No tracks match &quot;{query}&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
            {filtered.map((it) => (
              <TrackCard
                key={it.key}
                title={titleFor(it)}
                thumb={it.thumb}
                onSelect={() => selectTrack(it)}
              />
            ))}
          </div>
        )}
      </section>

      <section className={`${WIDE} pt-20`}>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold mb-2">Vote the next performance</h2>
          <p className="text-sm text-gray-300 mb-4">Pick which song you want live next.</p>
          <div className="flex gap-3 flex-wrap">
            {["Song A", "Song B", "Song C"].map((s) => (
              <button key={s} className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-red-400 hover:text-red-300">
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {modalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setModalItem(null)}
        >
          <div className="relative w-full max-w-[640px]" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-9 right-0 text-2xl leading-none text-white/80 hover:text-white"
              onClick={() => setModalItem(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-black shadow-2xl">
              <iframe
                src={`${modalItem.embed}?autoplay=1&rel=0`}
                title={meta[modalItem.key] ?? "1TakeQuan Track"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <div className="mt-3 break-words text-base font-bold text-white sm:text-lg">
              {meta[modalItem.key] ?? "1TakeQuan Track"}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
