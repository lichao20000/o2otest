#-*- coding: utf-8 -*-


class PrivBase(object): pass


class NegativePriv(PrivBase):

    def __init__(self, p):
        self.p = p

    def fullfilled_by(self, privs):
        return not self.p.fullfilled_by(privs)

    def __and__(self, p):
        return CombinedPriv(self, 'and', p)

    def __or__(self, p):
        return CombinedPriv(self, 'or', p)

    def __neg__(self, p):
        return self.p

    def __json__(self):
        return '-' + self.p.__json__()


class CombinedPriv(PrivBase):

    def __init__(self, p1, op, p2):
        self.p1 = p1
        self.op = op
        self.p2 = p2
        self.code = '%s %s  %s' % (self.p1.get_code(),op,self.p2.get_code())

    def fullfilled_by(self, privs):
        if not privs:
            return
        p1, p2 = self.p1, self.p2
        op = self.op
        if op == 'or':
            return p1.fullfilled_by(privs) or p2.fullfilled_by(privs)
        elif op == 'and':
            return p1.fullfilled_by(privs) and p2.fullfilled_by(privs)

    def __and__(self, p):
        return CombinedPriv(self, 'and', p)

    def __or__(self, p):
        return CombinedPriv(self, 'or', p)

    def __neg__(self):
        return NegativePriv(self)

    def __json__(self):
        expr = " ".join([self.p1.__json__(), self.op, self.p2.__json__()])
        return '(' + expr + ')'

    def get_code(self):
        return self.code



class Priv(PrivBase):

    def __init__(self, code):
        self.code = code

    def __str__(self):
        return self.code

    def fullfilled_by(self, privs):
        return privs and (self.code in privs)

    def __and__(self, p):
        return CombinedPriv(self, 'and', p)

    def __or__(self, p):
        return CombinedPriv(self, 'or', p)

    def __neg__(self):
        return NegativePriv(self)

    def __json__(self):
        return self.code

    def get_code(self):
        return self.code



if __name__ == '__main__':
    a = Priv('a')
    b = Priv('b')
    print (a | b).fullfilled_by(['a'])
    print (a & b).fullfilled_by(['a', 'b', 'c'])
    print (-b).fullfilled_by(['a', 'b', 'c'])
    print (-b).fullfilled_by(['a', 'c'])
