import json,argparse

def score(truth,predictions):
 ids=[x['id'] for x in truth]
 if len(set(ids))!=len(ids):raise ValueError('Duplicate holdout IDs')
 by={}
 for p in predictions:
  if p['id'] in by or p['id'] not in ids:raise ValueError('Duplicate or unknown prediction ID')
  by[p['id']]=p
 n=len(truth);cat=sev=joint=valid=0
 for t in truth:
  p=by.get(t['id'],{});c=p.get('category')==t['category'];s=p.get('severity')==t['severity'];cat+=c;sev+=s;joint+=c and s;valid+=bool(p.get('category') and p.get('severity'))
 return {'count':n,'category_accuracy':cat/n if n else None,'severity_accuracy':sev/n if n else None,'joint_accuracy':joint/n if n else None,'missing_or_invalid':n-valid}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('holdout');p.add_argument('predictions');a=p.parse_args();print(json.dumps(score(json.load(open(a.holdout)),json.load(open(a.predictions))),indent=2))
