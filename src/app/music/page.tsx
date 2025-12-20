"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";

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

type Kind = "all" | "single" | "project" | "video" | "popular";

type Item = {
  key: string;
  kind: Kind;
  id: string;
  url: string;     // normalized to music.youtube.com/watch?v=ID
  embed: string;   // youtube embed for web player
  thumb: string;
  title?: string;
  tag?: string;
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
        tag: Math.random() > 0.7 ? "popular" : undefined,
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

const FEATURED_ID = ""; // set a key from your catalog (e.g., "video:XXXXX")

export default function MusicPage() {
  const items = useMemo(() => buildItems(rawLinks), []);
  const { setPlaylist, currentTrack, currentIndex } = usePlayer();
  const [meta, setMeta] = useState<Record<string, string>>({});
  const [modalItem, setModalItem] = useState<Item | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Kind>("all");
  const [layout, setLayout] = useState<"rows" | "rail">("rail");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pairs = await Promise.all(
        items.map(async (it) => {
          const title = await fetchTitle(it.url);
          return title ? [it.key, title] : null;
        })
      );
      if (cancelled) return;
      const next: Record<string, string> = {};
      for (const p of pairs) if (p) next[p[0]] = p[1];
      setMeta(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [items]);

  const tracks = useMemo(() => {
    return items.map((it) => ({
      id: it.id,
      title: meta[it.key] ?? meta[it.id] ?? it.title ?? it.id, // more fallbacks
      cover: it.thumb,
      artists: ["1TakeQuan"],
      sources: { youtube: it.url },
    }));
  }, [items, meta]);

  const didInit = useRef(false);
  const didTitleRefresh = useRef(false);

  useEffect(() => {
    // only initialize once (prevents scroll/player resets)
    if (didInit.current) return;
    if (tracks.length === 0) return;

    setPlaylist(tracks, 0);
    didInit.current = true;
  }, [tracks, setPlaylist]);

  useEffect(() => {
    // once meta is loaded, refresh titles without changing what's playing
    if (!didInit.current) return;
    if (didTitleRefresh.current) return;
    if (!meta || Object.keys(meta).length === 0) return;

    const currentId = currentTrack?.id;
    const idx = currentId ? tracks.findIndex(t => t.id === currentId) : currentIndex;
    setPlaylist(tracks, idx >= 0 ? idx : 0);

    didTitleRefresh.current = true;
  }, [meta, tracks, currentTrack?.id, currentIndex, setPlaylist]);

  const featured = items.find((it) => it.key === FEATURED_ID) ?? items[0];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (tab === "popular" && it.tag !== "popular") return false;
      if (tab !== "all" && tab !== "popular" && it.kind !== tab) return false;
      const title = meta[it.key] ?? it.id;
      if (!q) return true;
      return title.toLowerCase().includes(q) || it.id.toLowerCase().includes(q);
    });
  }, [items, meta, query, tab]);

  const rows = useMemo(() => {
    const out: typeof filtered[] = [];
    for (let i = 0; i < filtered.length; i += 10) out.push(filtered.slice(i, i + 10));
    return out;
  }, [filtered]);

  const Card = ({ it }: { it: Item }) => {
    const title = meta[it.key] ?? (it.kind === "project" ? `Project • ${it.id}` : `Video • ${it.id}`);
    return (
      <div
        className="snap-start rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-red-500/60 transition group cursor-pointer"
        onClick={() => setModalItem(it)}
      >
        <div className="relative aspect-[5/3] bg-black">
          <Image src={it.thumb} alt={title} fill className="object-cover" unoptimized sizes="240px" />
          <button
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            aria-label="Play"
          >
            <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shadow">
              <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        </div>
        <div className="px-3 py-2">
          <div className="text-xs font-semibold text-white line-clamp-2">{title}</div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
            <span className="truncate pr-2">{it.id}</span>
            <a href={it.url} target="_blank" rel="noreferrer" className="hover:text-red-300" onClick={(e) => e.stopPropagation()}>
              Open
            </a>
          </div>
        </div>
      </div>
    );
  };

  const Rail = ({ data }: { data: Item[] }) => {
    const ref = useRef<HTMLDivElement>(null);
    const scrollPos = useRef(0);

    const CARD_W = 192;
    const scrollByCards = (dir: number) => {
      if (!ref.current) return;
      ref.current.scrollBy({ left: dir * CARD_W * 10, behavior: "smooth" });
    };

    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      const onScroll = () => {
        scrollPos.current = el.scrollLeft;
      };

      el.addEventListener("scroll", onScroll, { passive: true });
      return () => el.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      // restore after re-render / data changes
      el.scrollLeft = scrollPos.current;
    }, [data.length]);

    return (
      <div className="relative">
        <div ref={ref} className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth">
          {data.map((it) => (
            <div key={it.key} style={{ minWidth: 180, width: 180 }}>
              <Card it={it} />
            </div>
          ))}
        </div>
        <button
          onClick={() => scrollByCards(-1)}
          className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-black/70 border border-zinc-700 hover:bg-black/90"
          aria-label="Scroll left"
        >
          ‹
        </button>
        <button
          onClick={() => scrollByCards(1)}
          className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-black/70 border border-zinc-700 hover:bg-black/90"
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-black text-white pb-16">
      <section className="relative overflow-hidden border-b border-zinc-900 bg-gradient-to-br from-zinc-900 via-black to-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-14 grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-red-400">Featured Release</p>
            <h1 className="mt-2 text-4xl sm:text-5xl font-bold">{meta[featured?.key ?? ""] ?? "1TakeQuan — Featured"}</h1>
            <p className="mt-4 text-gray-300">"The Great Quan — not a tape, a statement."</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setModalItem(featured)}
                className="rounded-full bg-red-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-red-400"
              >
                ▶ Play
              </button>
              <a
                href={featured?.url ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm hover:border-red-400 hover:text-red-300"
              >
                🎥 Watch Video
              </a>
              <button className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm hover:border-red-400 hover:text-red-300">
                💾 Save
              </button>
            </div>
          </div>
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-red-500/20">
            {featured ? (
              <Image src={featured.thumb} alt="Featured artwork" fill className="object-cover" unoptimized sizes="600px" />
            ) : (
              <div className="w-full h-full bg-zinc-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pt-10">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {(["all", "single", "project", "video", "popular"] as Kind[]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-full px-4 py-2 text-sm border ${
                tab === k ? "border-red-400 text-white bg-red-500/20" : "border-zinc-700 text-gray-300 hover:border-red-400"
              }`}
            >
              {k === "all" ? "All" : k === "project" ? "Projects" : k === "video" ? "Videos" : k === "popular" ? "Popular" : "Singles"}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or ID..."
              className="w-56 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-gray-500"
            />
            <button
              onClick={() => setLayout((l) => (l === "rows" ? "rail" : "rows"))}
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-red-400 hover:text-red-300"
              title="Toggle layout"
            >
              {layout === "rows" ? "Horizontal" : "Rows of 10"}
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-gray-400">No results.</div>
        ) : layout === "rows" ? (
          <div className="space-y-4">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {row.map((it) => (
                  <Card key={it.key} it={it} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <Rail data={filtered} />
        )}
      </section>

      <section className="max-w-6xl mx-auto px-6 pt-12 space-y-8">
        <h2 className="text-2xl font-bold">Curated Collections</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            { title: "For New Fans", desc: "Start here — the essentials.", color: "from-red-500/30" },
            { title: "Turn-Up Quan", desc: "High energy, stage-ready.", color: "from-orange-500/30" },
            { title: "Pain / Late Night", desc: "Reflective, raw, 2AM vibe.", color: "from-purple-500/30" },
            { title: "Underrated", desc: "Sleeper picks the day-ones know.", color: "from-blue-500/30" },
          ].map((c) => (
            <div
              key={c.title}
              className={`rounded-2xl border border-zinc-800 bg-gradient-to-br ${c.color} to-black p-5 shadow-lg shadow-black/30`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{c.title}</div>
                  <div className="text-sm text-gray-300 mt-1">{c.desc}</div>
                </div>
                <button className="text-sm text-red-300 hover:text-white">View</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pt-12">
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
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setModalItem(null)}>
          <div className="bg-zinc-900 rounded-lg p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-white text-2xl" onClick={() => setModalItem(null)} aria-label="Close">
              &times;
            </button>
            <iframe
              src={`${modalItem.embed}?autoplay=1&rel=0`}
              title={meta[modalItem.key] ?? modalItem.id}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-[480px] h-[270px] rounded"
            />
            <div className="mt-4 text-white text-lg font-bold">{meta[modalItem.key] ?? modalItem.id}</div>
          </div>
        </div>
      )}
    </main>
  );
}