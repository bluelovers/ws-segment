# README

    simple segment api server 

https://segment-api.bluelovers.now.sh/demo.html

> https://segment-api.bluelovers.now.sh/?input=%E5%8E%BB%E9%99%A4%E5%81%9C%E6%AD%A2%E7%AC%A6

can use `GET` , `POST`

## options

```ts
{
 input: [
  '韓國明文禁止遊戲代練 即日起代練遊戲獲利者將處以兩年以下有期徒刑',
  '欢迎来到维基词典。',
 ],
 options: {
  /**
   * 不返回词性
   */
  //simple: true,

  /**
   * 去除标点符号
   */
  //stripPunctuation: true,

  /**
   * 转换同义词
   */
  //convertSynonym: true,

  /**
   * 去除停止符
   */
  //stripStopword: true,

  //stripSpace: true,
 },
}
```

## return

```json
{ 
 "code": 1, 
 "count": 1, 
 "timestamp": 1561697083578, 
 "time": 11, 
 "results": [] 
}
```
